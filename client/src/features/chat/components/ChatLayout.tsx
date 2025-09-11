import {useEffect, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import socket from "@/config/socket.ts";
import {getChats} from "@/apis/chatApis.ts";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {
  Camera,
  ChevronDown,
  Mic,
  MicOff,
  Paperclip,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Smile,
  Square,
  Video,
  X
} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {shortLastSeen} from "@/lib/utils.ts";
import type {IUser} from "@/types/IUser.ts";
import type {IMessage} from "@/types/message.ts";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import EmojiPicker, {EmojiStyle, Theme} from "emoji-picker-react";
import {useTheme} from "@/providers/ThemeProvider.tsx";
import EnhancedChatHeader from "@/features/chat/components/chat-body/ChatHeader.tsx";

interface MediaItem {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio';
}

const ChatLayout = ({selectedChatUser, currentRoomId, userId, messages, setMessages}: {
  selectedChatUser: IUser,
  currentRoomId: string,
  userId: string,
  messages: IMessage[],
  setMessages: (messages: IMessage[]) => void,
}) => {
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const {data} = useQuery({
    queryKey: ['chatMessages', currentRoomId],
    queryFn: ({signal}) => getChats(currentRoomId, signal),
    enabled: !!currentRoomId,
  })

  const {theme} = useTheme()

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isTyping, setIsTyping] = useState({
    senderId: null as string | null,
    isTyping: false,
  });

  const [msg, setMsg] = useState("");

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Media preview states
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem[]>([]);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});

      const options = {mimeType: 'audio/webm;codecs=opus'};
      if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        options.mimeType = 'audio/mp4;codecs=mp4a.40.2';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, {type: recorder.mimeType});
        setVoiceBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
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
        let base64Audio = reader.result as string;

        // Clean the MIME type
        if (base64Audio.includes('audio/mp4;codecs=')) {
          base64Audio = base64Audio.replace(/audio\/mp4;codecs=[^;]+;/, 'audio/mp4;');
        } else if (base64Audio.includes('audio/webm;codecs=')) {
          base64Audio = base64Audio.replace(/audio\/webm;codecs=[^;]+;/, 'audio/webm;');
        }

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

  // Media preview functions
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const mediaItems: MediaItem[] = [];

    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      let type: 'image' | 'video' | 'audio' = 'image';

      if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      }

      mediaItems.push({file, url, type});
    });

    if (mediaItems.length > 0) {
      setPreviewMedia(prev => [...prev, ...mediaItems]);
      setShowMediaPreview(true);
    }
  };

  const addMoreFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,audio/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileSelect(target.files);
      }
    };
    input.click();
  };

  const removeMediaItem = (index: number) => {
    const newMedia = [...previewMedia];
    URL.revokeObjectURL(newMedia[index].url);
    newMedia.splice(index, 1);
    setPreviewMedia(newMedia);

    if (newMedia.length === 0) {
      setShowMediaPreview(false);
    }
  };

  const closeMediaPreview = () => {
    previewMedia.forEach(media => URL.revokeObjectURL(media.url));
    setPreviewMedia([]);
    setShowMediaPreview(false);
  };

  // Camera functions
  const startCamera = async (mode: 'photo' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: 'user'},
        audio: mode === 'video'
      });

      setCameraStream(stream);
      setCameraMode(mode);
      setShowCamera(true);

      // Wait for video element to be available and set stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRecorder && videoRecorder.state !== 'inactive') {
      videoRecorder.stop();
    }
    setShowCamera(false);
    setIsRecordingVideo(false);
    setVideoRecorder(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      if (context && video.videoWidth > 0) {
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, {type: 'image/jpeg'});
            const url = URL.createObjectURL(file);
            const mediaItem: MediaItem = {file, url, type: 'image'};

            setPreviewMedia(prev => [...prev, mediaItem]);
            setShowMediaPreview(true);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      } else {
        alert('Camera not ready. Please wait a moment and try again.');
      }
    }
  };

  const startVideoRecording = () => {
    if (cameraStream && !isRecordingVideo) {
      try {
        const options: MediaRecorderOptions = {};
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          options.mimeType = 'video/webm;codecs=vp8,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options.mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options.mimeType = 'video/mp4';
        }

        const recorder = new MediaRecorder(cameraStream, options);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const videoBlob = new Blob(chunks, {type: recorder.mimeType || 'video/webm'});
          const file = new File([videoBlob], `video-${Date.now()}.webm`, {type: videoBlob.type});
          const url = URL.createObjectURL(file);
          const mediaItem: MediaItem = {file, url, type: 'video'};

          setPreviewMedia(prev => [...prev, mediaItem]);
          setShowMediaPreview(true);
          stopCamera();
        };

        recorder.onerror = (event) => {
          console.error('Recording error:', event);
          alert('Error occurred while recording video.');
          setIsRecordingVideo(false);
        };

        setVideoRecorder(recorder);
        recorder.start(1000);
        setIsRecordingVideo(true);

      } catch (error) {
        console.error('Error starting video recording:', error);
        alert('Could not start video recording.');
      }
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorder && videoRecorder.state === 'recording') {
      videoRecorder.stop();
      setIsRecordingVideo(false);
    }
  };

  const sendMessage = async () => {
    if (previewMedia.length > 0) {
      const mediaBase64 = await Promise.all(
        previewMedia.map((mediaItem) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(mediaItem.file);
          });
        })
      );

      socket.emit("send-message", {
        roomId: currentRoomId,
        message: msg,
        media: mediaBase64,
      });

      closeMediaPreview();
      setMsg('');
      return;
    } else if (msg.trim() === "") {
      return;
    } else {
      socket.emit("send-message", {
        roomId: currentRoomId,
        message: msg,
        media: [],
      });
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
      previewMedia.forEach(media => URL.revokeObjectURL(media.url));
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (videoRecorder && videoRecorder.state !== 'inactive') {
        videoRecorder.stop();
      }
    };
  }, [cameraStream, previewMedia, videoRecorder]);

  return (
    <Card className="flex-1 flex flex-col h-full pt-2 gap-0">
      <EnhancedChatHeader
        selectedChatUser={selectedChatUser}
      />

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
                          ? "bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary-foreground dark:text-white rounded-br-md"
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
                                  <Mic className="w-4 h-4"/>
                                  <audio controls className="flex-1">
                                    <source src={media} type="audio/mpeg"/>
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
            <div
              className={'p-1 cursor-pointer absolute bottom-2 right-2 z-10 rounded-full bg-muted/50 hover:bg-muted/70 text-muted-foreground hover:text-foreground'}>
              <ChevronDown/>
            </div>
          )}

          <div ref={messagesEndRef}/>
        </ScrollArea>

        <Separator className="my-4"/>

        {/* Camera Modal */}
        {showCamera && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-xl p-4 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {cameraMode === 'photo' ? 'Take Photo' : 'Record Video'}
                </h3>
                <Button variant="ghost" size="icon" onClick={stopCamera}>
                  <X className="w-4 h-4"/>
                </Button>
              </div>

              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden"/>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12"
                    onClick={() => setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')}
                    disabled={isRecordingVideo}
                  >
                    <RotateCcw className="w-5 h-5"/>
                  </Button>

                  {cameraMode === 'photo' ? (
                    <Button
                      size="icon"
                      className="w-16 h-16 rounded-full"
                      onClick={capturePhoto}
                    >
                      <Camera className="w-6 h-6"/>
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      className={`w-16 h-16 rounded-full ${isRecordingVideo ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
                    >
                      {isRecordingVideo ? <Square className="w-6 h-6"/> : <Video className="w-6 h-6"/>}
                    </Button>
                  )}
                </div>

                {isRecordingVideo && (
                  <div
                    className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {showMediaPreview && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-xl p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Preview Media ({previewMedia.length})</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addMoreFiles}>
                    <Plus className="w-4 h-4 mr-1"/>
                    Add More
                  </Button>
                  <Button variant="ghost" size="icon" onClick={closeMediaPreview}>
                    <X className="w-4 h-4"/>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {previewMedia.map((media, index) => (
                  <div key={index} className="relative group">
                    {media.type === 'image' && (
                      <img
                        src={media.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    {media.type === 'video' && (
                      <video
                        src={media.url}
                        className="w-full h-40 object-cover rounded-lg"
                        controls
                      />
                    )}
                    {media.type === 'audio' && (
                      <div className="w-full h-40 bg-muted rounded-lg flex flex-col items-center justify-center">
                        <Mic className="w-8 h-8 mb-2 text-muted-foreground"/>
                        <audio controls className="w-full">
                          <source src={media.url}/>
                        </audio>
                      </div>
                    )}

                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMediaItem(index)}
                    >
                      <X className="w-3 h-3"/>
                    </Button>

                    <div
                      className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs capitalize">
                      {media.type}
                    </div>
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
                <Button onClick={sendMessage} disabled={previewMedia.length === 0}>
                  <Send className="w-4 h-4 mr-1"/>
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 bg-red-500 rounded-full ${!isPaused ? 'animate-pulse' : ''}`}/>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {isPaused ? 'Paused' : 'Recording'}: {formatTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={cancelRecording}>
                Cancel
              </Button>
              {isPaused ? (
                <Button size="sm" onClick={resumeRecording}>
                  <Play className="w-4 h-4 mr-1"/>
                  Resume
                </Button>
              ) : (
                <Button size="sm" onClick={pauseRecording}>
                  <Pause className="w-4 h-4 mr-1"/>
                  Pause
                </Button>
              )}
              <Button size="sm" onClick={stopRecording}>
                <Square className="w-4 h-4 mr-1"/>
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Voice Message Preview */}
        {voiceBlob && !isRecording && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
            <Mic className="w-4 h-4"/>
            <span className="text-sm">Voice message recorded ({formatTime(recordingTime)})</span>
            <audio controls className="flex-1 max-w-xs">
              <source src={URL.createObjectURL(voiceBlob)} type={voiceBlob.type}/>
              Your browser does not support the audio element.
            </audio>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setVoiceBlob(null)}>
                Delete
              </Button>
              <Button size="sm" onClick={sendVoiceMessage}>
                <Send className="w-4 h-4 mr-1"/>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                  <Smile className="w-4 h-4"/>
                </Button>
              </PopoverTrigger>
              <PopoverContent className={'p-0 w-auto h-auto shadow-none'}>
                <EmojiPicker
                  emojiStyle={EmojiStyle.FACEBOOK}
                  skinTonesDisabled={true}
                  autoFocusSearch={true}
                  theme={theme as Theme}
                  onEmojiClick={(emoji) => {
                    setMsg((prev) => prev + emoji.emoji);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* File Upload Button */}
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
              accept="image/*,video/*,audio/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* Camera Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => startCamera('photo')}
            >
              <Camera className="w-4 h-4"/>
            </Button>

            {/* Voice Record Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!!voiceBlob}
            >
              {isRecording ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
            </Button>

            <Button
              size="icon"
              className="w-8 h-8 rounded-lg dark:bg-primary/20 bg-primary/10 text-muted-foreground hover:text-white cursor-pointer"
              disabled={!(previewMedia.length > 0) && !msg.trim() && !voiceBlob}
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