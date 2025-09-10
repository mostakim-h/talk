import {useCallback, useEffect, useRef, useState} from 'react';
import {Mic, MicOff, Phone, PhoneOff, Video, VideoOff} from 'lucide-react';
import {cropImage, shortLastSeen} from "@/lib/utils.ts";
import socket from "@/config/socket.ts";
import {Avatar} from "@/components/ui/avatar.tsx";
import {AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import type {IUser} from "@/types/IUser.ts";
import * as React from "react";
import {Card} from "@/components/ui/card.tsx";

// WebRTC Configuration
const rtcConfig = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'}
  ]
};

// Call types
const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video'
};

// Call states
const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended'
};

type incomingCallType = {
  callType: string,
  from: string,
  offer: RTCSessionDescriptionInit
} | null;

// WebRTC Call Manager Hook
const useWebRTCCall = () => {
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [callType, setCallType] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<incomingCallType>(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef<object>(null);
  const peerConnectionRef = useRef<object>(null);
  const localStreamRef = useRef<object>(null);
  const remoteStreamRef = useRef<object>(null);

  // Initialize peer connection
  const initializePeerConnection = useCallback((recipientId: string) => {
    const peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: recipientId
        });
      }
    };

    peerConnection.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setCallState(CALL_STATES.CONNECTED);
      } else if (peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'closed') {
        endCall();
      }
    };

    return peerConnection;
  }, []);

  // Start call
  const startCall = async (type: string, recipientId: string) => {
    try {
      setCallType(type);
      setCallState(CALL_STATES.CALLING);

      const constraints = {
        audio: true,
        video: type === CALL_TYPES.VIDEO
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = initializePeerConnection(recipientId);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('call-offer', {
        offer,
        callType: type,
        to: recipientId,
        from: socket.id // Include caller's socket ID
      });

    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  };

  // Answer call
  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      setCallState(CALL_STATES.CONNECTED);
      setCallType(incomingCall.callType);

      const constraints = {
        audio: true,
        video: incomingCall.callType === CALL_TYPES.VIDEO
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = initializePeerConnection(incomingCall.from);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      await peerConnection.setRemoteDescription(incomingCall.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('call-answer', {
        answer,
        to: incomingCall.from
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
      rejectCall();
    }
  };

  // Reject call
  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('call-rejected', {to: incomingCall.from});
      setIncomingCall(null);
    }
    setCallState(CALL_STATES.IDLE);
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    socket.emit('call-ended');

    setCallState(CALL_STATES.IDLE);
    setCallType(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIncomingCall(null);
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  // Socket event listeners
  useEffect(() => {
    socket.on('incoming-call', (data) => {
      setIncomingCall(data);
      setCallState(CALL_STATES.RINGING);
    });

    socket.on('call-answered', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(data.answer);
        setCallState(CALL_STATES.CONNECTED);
      }
    });

    socket.on('call-rejected', () => {
      endCall();
    });

    socket.on('call-ended', () => {
      endCall();
    });

    socket.on('ice-candidate', async (data) => {
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('call-rejected');
      socket.off('call-ended');
      socket.off('ice-candidate');
    };
  }, [endCall]);

  return {
    callState,
    callType,
    isAudioMuted,
    isVideoMuted,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
};

// Call Interface Component
const CallInterface = (
  {
    callState,
    callType,
    isAudioMuted,
    isVideoMuted,
    localVideoRef,
    remoteVideoRef,
    onEndCall,
    onToggleAudio,
    onToggleVideo,
    selectedChatUser
  } : {
    callState: string,
    callType: string,
    isAudioMuted: boolean,
    isVideoMuted: boolean,
    localVideoRef: React.RefObject<HTMLVideoElement>,
    remoteVideoRef: React.RefObject<HTMLVideoElement>,
    onEndCall: () => void,
    onToggleAudio: () => void,
    onToggleVideo: () => void,
    selectedChatUser: IUser
  }) => {
  if (callState === CALL_STATES.IDLE) return null;

  return (
    <Card className="fixed inset-0 z-50 flex flex-col">
      {/* Remote video/avatar */}
      <div className="flex-1 relative">
        {callType === CALL_TYPES.VIDEO ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center from-blue-500 to-purple-600">
            <div className="text-center">
              <Avatar className="w-32 h-32 flex items-center justify-center mx-auto mb-4">
                <AvatarImage
                  src={cropImage(selectedChatUser.avatar) || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
                <AvatarFallback>
                  {selectedChatUser?.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl text-white font-medium">{selectedChatUser?.fullName}</h2>
              <p className="text-white/80">
                {callState === CALL_STATES.CALLING && "Calling..."}
                {callState === CALL_STATES.CONNECTED && "Connected"}
              </p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        {callType === CALL_TYPES.VIDEO && (
          <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="p-6 absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm flex flex-col items-center gap-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-6 h-6 text-white"/>
            ) : (
              <Mic className="w-6 h-6 text-white"/>
            )}
          </button>

          {callType === CALL_TYPES.VIDEO && (
            <button
              onClick={onToggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isVideoMuted ? (
                <VideoOff className="w-6 h-6 text-white"/>
              ) : (
                <Video className="w-6 h-6 text-white"/>
              )}
            </button>
          )}

          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white"/>
          </button>
        </div>
      </div>
    </Card>
  );
};

// Incoming Call Modal
const IncomingCallModal = (
  {
    incomingCall,
    onAnswer,
    onReject,
    selectedChatUser
  } : {
    incomingCall: {callType: string, from: string, offer: RTCSessionDescriptionInit} | null,
    onAnswer: () => void,
    onReject: () => void,
    selectedChatUser: IUser
  }) => {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <Avatar className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AvatarImage
              src={cropImage(selectedChatUser.avatar) || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
            <AvatarFallback>
              {selectedChatUser?.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold mb-2">
            {selectedChatUser?.fullName}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Incoming {incomingCall.callType} call...
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onReject}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white"/>
            </button>
            <button
              onClick={onAnswer}
              className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            >
              <Phone className="w-6 h-6 text-white"/>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Enhanced Chat Header with WebRTC
const EnhancedChatHeader = ({selectedChatUser} : {selectedChatUser: IUser}) => {

  const {
    callState,
    callType,
    isAudioMuted,
    isVideoMuted,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo
  } = useWebRTCCall();

  return (
    <div className="relative">
      {/* Original Header */}
      <div className="px-2 py-0">
        <div className="bg-muted/90 flex items-center justify-between gap-4 px-4 py-2 rounded-lg">
          {/* Avatar and User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={cropImage(selectedChatUser.avatar) || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
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
              <p className={`text-xs ${
                selectedChatUser?.isOnline ? "text-green-500" : "text-muted-foreground"
              }`}>
                {selectedChatUser?.isOnline
                  ? "Online"
                  : selectedChatUser && shortLastSeen(selectedChatUser?.updatedAt)}
              </p>
            </div>
          </div>

          {/* Enhanced Buttons with WebRTC */}
          <div className="flex gap-5 items-center">
            <div className="bg-white/80 dark:bg-teal-950 p-3 px-4 rounded-md transition-colors flex gap-5 items-center">
              <button
                onClick={() => startCall(CALL_TYPES.VIDEO, selectedChatUser?._id)}
                disabled={callState !== CALL_STATES.IDLE || !selectedChatUser}
                className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Video className="w-5 h-5"/>
              </button>
              <button
                onClick={() => startCall(CALL_TYPES.AUDIO, selectedChatUser?._id)}
                disabled={callState !== CALL_STATES.IDLE || !selectedChatUser}
                className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Phone className="w-4 h-4"/>
              </button>
            </div>
            <button className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Call Interface */}
      <CallInterface
        callState={callState}
        callType={callType}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onEndCall={endCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        selectedChatUser={selectedChatUser}
      />

      {/* Incoming Call Modal */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAnswer={answerCall}
        onReject={rejectCall}
        selectedChatUser={selectedChatUser}
      />
    </div>
  );
};

export default EnhancedChatHeader;