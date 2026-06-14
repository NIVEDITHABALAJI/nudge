import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';

const VideoCall = ({ socket, workspaceId, user }) => {
  const [callState, setCallState] = useState('idle');
  const [incomingCall, setIncomingCall] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const handleIncomingCall = (data) => {
      if (peerRef.current) return; // already in a call
      setIncomingCall(data);
      setCallState('incoming');
    };

    const handleCallAccepted = (data) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    };

    const handleCallEnded = () => {
      cleanUp();
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket]);

  const getMedia = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    streamRef.current = mediaStream;
    setStream(mediaStream);
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = mediaStream;
    }
    return mediaStream;
  };

  const cleanUp = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    peerRef.current?.destroy();
    peerRef.current = null;
    streamRef.current = null;
    setStream(null);
    setCallState('idle');
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const startCall = async () => {
    try {
      setCallState('calling');
      const mediaStream = await getMedia();

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream
      });

      peer.on('signal', (signal) => {
        socket.emit('call_user', { workspaceId, signal });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState('in-call');
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        cleanUp();
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('Error starting call:', err);
      setCallState('idle');
    }
  };

  const answerCall = async () => {
    try {
      const mediaStream = await getMedia();

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream
      });

      peer.on('signal', (signal) => {
        socket.emit('answer_call', { workspaceId, signal });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState('in-call');
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        cleanUp();
      });

      peer.signal(incomingCall.signal);
      peerRef.current = peer;
    } catch (err) {
      console.error('Error answering call:', err);
      cleanUp();
    }
  };

  const endCall = () => {
    socket.emit('end_call', { workspaceId });
    cleanUp();
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="relative">
      {/* Video Call Button */}
      {callState === 'idle' && (
        <button
          onClick={startCall}
          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-semibold rounded-lg transition flex items-center gap-1"
        >
          📹 Start Call
        </button>
      )}

      {/* Calling state */}
      {callState === 'calling' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">📹</span>
            </div>
            <p className="text-white text-lg font-semibold mb-2">Calling...</p>
            <p className="text-gray-400 text-sm mb-6">Waiting for someone to answer</p>
            <button
              onClick={endCall}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition"
            >
              ❌ Cancel
            </button>
          </div>
          <video ref={myVideoRef} autoPlay playsInline muted className="hidden" />
        </div>
      )}

      {/* Incoming call */}
      {callState === 'incoming' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-3xl">📹</span>
            </div>
            <p className="text-white text-lg font-semibold mb-2">
              {incomingCall?.from} is calling...
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={answerCall}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition"
              >
                ✅ Answer
              </button>
              <button
                onClick={() => { setCallState('idle'); setIncomingCall(null); }}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition"
              >
                ❌ Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In call */}
      {callState === 'in-call' && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded-xl border-2 border-white"
            />
          </div>
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-2xl transition"
            >
              📵
            </button>
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoOff ? '🚫' : '📹'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;