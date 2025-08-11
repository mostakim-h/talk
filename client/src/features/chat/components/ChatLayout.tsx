import {useEffect, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import socket from "@/config/socket.ts";
import {getChats} from "@/apis/chatApis.ts";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {ChevronDown, Edit3, Paperclip, Phone, Search, Send, Smile, Video, Mic, MicOff, Play, Pause, X} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {cropImage, shortLastSeen} from "@/lib/utils.ts";
import type {IUser} from "@/types/IUser.ts";
import type {IMessage} from "@/types/message.ts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ChatLayout = ({selectedChatUser, currentRoomId, userId}: {
  selectedChatUser: IUser,
  currentRoomId: string,
  userId: string
}) => {
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const {data} = useQuery({
    queryKey: ['chatMessages', currentRoomId],
    queryFn: ({signal}) => getChats(currentRoomId, signal),
    enabled: !!currentRoomId,
  })

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [isTyping, setIsTyping] = useState({
    senderId: null as string | null,
    isTyping: false,
  });

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  console.log('messages', messages)

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Image preview states
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<{file: File, url: string}[]>([]);

  console.log('selectedFiles', selectedFiles);

  const handleInitMsg = (messages: IMessage[]) => {
    if (messages && messages.length > 0) {
      setMessages(messages);
    } else {
      setMessages([]);
    }
  }

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setVoiceBlob(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setVoiceBlob(null);
    setRecordingTime(0);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const sendVoiceMessage = async () => {
    if (voiceBlob) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result as string;

        socket.emit("send-message", {
          roomId: currentRoomId,
          message: "",
          media: [base64Audio],
          type: 'voice'
        });

        setVoiceBlob(null);
        setRecordingTime(0);
      };
      reader.readAsDataURL(voiceBlob);
    }
  };

  // Image preview functions
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const previews = imageFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));

      setPreviewImages(previews);
      setSelectedFiles(imageFiles);
      setShowImagePreview(true);
    } else {
      // Handle non-image files directly
      setSelectedFiles(newFiles);
    }
  };

  const removePreviewImage = (index: number) => {
    const newPreviews = [...previewImages];
    const newFiles = [...selectedFiles];

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index].url);

    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);

    setPreviewImages(newPreviews);
    setSelectedFiles(newFiles);

    if (newPreviews.length === 0) {
      setShowImagePreview(false);
    }
  };

  const closeImagePreview = () => {
    // Clean up URLs
    previewImages.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviewImages([]);
    setSelectedFiles([]);
    setShowImagePreview(false);
  };

  const sendMessage = async () => {
    if (selectedFiles.length > 0) {
      const mediaBase64 = await Promise.all(
        selectedFiles.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      socket.emit("send-message", {
        roomId: currentRoomId,
        message: msg,
        media: mediaBase64,
      })

      closeImagePreview();
      setMsg('');

      return;
    } else if (msg.trim() === "") {
      return;
    } else {
      socket.emit("send-message", {
        roomId: currentRoomId,
        message: msg,
        media: [],
      })
      setMsg('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    socket.on("receive-message", (data: IMessage) => {
      setMessages((prev: IMessage[]) => [...prev, data]);
    })

    socket.on("user-typing", (data: { senderId: string }) => {
      setIsTyping({
        senderId: data.senderId,
        isTyping: true,
      });

      setTimeout(() => {
        setIsTyping({
          senderId: null,
          isTyping: false,
        });
      }, 2000);
    })

    return () => {
      socket.off("receive-message");
      socket.off("user-typing");
    };
  }, []);

  useEffect(() => {
    if (data) {
      handleInitMsg(data);
    }
  }, [data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "auto"})
  }, [messages])

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
        setShowScrollToBottom(false);
      } else {
        setShowScrollToBottom(true);
      }
    };

    const scrollArea = document.querySelector('.scroll-area') as HTMLDivElement;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => {
        scrollArea.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  return (
    <Card className="flex-1 flex flex-col h-full pt-2 gap-0">
      <CardHeader className="px-2 py-0">
        <div className="bg-muted/90 flex items-center justify-between gap-4 px-4 py-2 rounded-lg">
          {/* Avatar and User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={cropImage(selectedChatUser.avatar) || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
              <AvatarFallback>
                {selectedChatUser?.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="m-0 font-medium">
                {selectedChatUser?.fullName || "Select a user"}
              </h2>
              <p
                className={`text-xs ${
                  selectedChatUser?.isOnline
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                {selectedChatUser?.isOnline
                  ? "Online"
                  : selectedChatUser && shortLastSeen(selectedChatUser?.updatedAt)}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-5 items-center">
            <div className="bg-white/80 dark:bg-teal-950 p-3 px-4 rounded-md transition-colors cursor-pointer flex gap-5 items-center">
              <Video className=" w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"/>
              <Phone className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"/>
            </div>
            <Search className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"/>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 overflow-y-auto pr-4 relative scroll-area">
          <div className="space-y-4">
            {messages && messages.length !== 0 ? (
              messages.map((message) => (
                <div key={message._id} className={`flex gap-3 ${message.senderId === userId ? "justify-end" : ""}`}>
                  {message.senderId !== userId && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={'https://avatars.githubusercontent.com/u/124599?v=4'}/>
                      <AvatarFallback>
                        {selectedChatUser?.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-md ${message.senderId === userId ? "order-first" : ""}`}>
                    {message.senderId !== userId && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{shortLastSeen(message.createdAt)}</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${
                        message.senderId === userId
                          ? "bg-primary dark:bg-primary/20 text-primary-foreground dark:text-white rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {message.content.media && message.content.media.length > 0 && (
                        <div
                          className={`grid gap-2 mb-2 ${
                            message.content.media.length > 1 ? "grid-cols-2" : "grid-cols-1"
                          }`}
                        >
                          {message.content.media.map((media: string, index: number) => {
                            const isVideo = media.match(/\.(mp4|webm|ogg)$/i) || media.includes('video');
                            const isAudio = media.match(/\.(mp3|wav|m4a|ogg)$/i) || media.includes('audio') || message.type === 'voice';

                            if (isAudio) {
                              return (
                                <div key={index} className="flex items-center gap-2 bg-background/20 p-2 rounded-lg">
                                  <Mic className="w-4 h-4" />
                                  <audio controls className="flex-1">
                                    <source src={media} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              );
                            } else if (isVideo) {
                              return (
                                <video
                                  key={index}
                                  src={media}
                                  controls
                                  className="max-w-full h-auto rounded-lg"
                                />
                              );
                            } else {
                              return (
                                <img
                                  key={index}
                                  src={media}
                                  alt={`Media ${index + 1}`}
                                  className="max-w-full h-auto rounded-lg"
                                />
                              );
                            }
                          })}
                        </div>
                      )}

                      {message.content.message && (
                        <p className="text-sm">{message.content.message}</p>
                      )}
                    </div>
                    {message.senderId === userId && (
                      <div className="text-right mt-1">
                        <span className="text-xs text-muted-foreground">{shortLastSeen(message.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}

            {/* Typing Indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
              {isTyping?.isTyping && isTyping?.senderId === selectedChatUser?._id && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"/>
                  <div
                    className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                    style={{animationDelay: "0.1s"}}/>
                  <div
                    className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                    style={{animationDelay: "0.2s"}}
                  />
                </div>
              )}
            </div>
          </div>

          {showScrollToBottom && (
            <div className={'p-1 cursor-pointer absolute bottom-2 right-2 z-10 rounded-full bg-muted/50 hover:bg-muted/70 text-muted-foreground hover:text-foreground'}>
              <ChevronDown/>
            </div>
          )}

          <div ref={messagesEndRef}/>
        </ScrollArea>

        <Separator className="my-4"/>

        {/* Image Preview Modal */}
        {showImagePreview && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-xl p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Preview Images</h3>
                <Button variant="ghost" size="icon" onClick={closeImagePreview}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePreviewImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a caption..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={sendMessage} disabled={selectedFiles.length === 0}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                Recording: {formatTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={cancelRecording}>
                Cancel
              </Button>
              <Button size="sm" onClick={stopRecording}>
                <MicOff className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Voice Message Preview */}
        {voiceBlob && !isRecording && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice message recorded ({formatTime(recordingTime)})</span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setVoiceBlob(null)}>
                Delete
              </Button>
              <Button size="sm" onClick={sendVoiceMessage}>
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-end gap-3 p-3 bg-muted/50 rounded-xl relative">
          <Textarea
            placeholder="Write your message..."
            value={msg}
            onKeyDown={() => socket.emit("typing", {receiverId: selectedChatUser?._id})}
            onChange={(e) => setMsg(e.target.value)}
            className="flex-1 min-h-[40px] max-h-32 bg-transparent border-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground"
            rows={1}
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <Smile className="w-4 h-4"/>
            </Button>
            <Label
              className="w-8 h-8 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center"
              htmlFor="file-upload"
            >
              <Paperclip className="w-4 h-4"/>
            </Label>
            <Input
              className="hidden"
              id="file-upload"
              multiple={true}
              type="file"
              accept="*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* Voice Record Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={!!voiceBlob}
            >
              {isRecording ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
            </Button>

            <Button
              size="icon"
              className="w-8 h-8 rounded-lg dark:bg-primary/20 bg-primary/10 text-muted-foreground hover:text-white cursor-pointer"
              disabled={!(selectedFiles.length > 0) && !msg.trim() && !voiceBlob}
              onClick={sendMessage}
            >
              <Send className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatLayout;