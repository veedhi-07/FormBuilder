import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import toast from "react-hot-toast";

export default function useWebRTC() {
  const navigate = useNavigate();
  const roomRef = useRef<ReturnType<typeof doc> | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");

  //Common Initializer //

  const initializePeer = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);

    const mics = devices.filter((d) => d.kind === "audioinput");
    setMicrophones(mics);

    if (mics.length > 0) {
      setSelectedMic(mics[0].deviceId);
    }

    // const speakers = devices.filter((d) => d.kind === "audiooutput");

    peerRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    localStreamRef.current.getTracks().forEach((track) => {
      peerRef.current?.addTrack(track, localStreamRef.current!);
    });

    peerRef.current.ontrack = (event) => {
      console.log("Remote Track Received");

      setRemoteJoined(true);

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };
  };
  ////create calll
  const createCall = async (roomId: string) => {
    await initializePeer();

    // const roomRef = doc(db, "calls", roomId);
    const room = doc(db, "calls", roomId);
    roomRef.current = room;

    const callerCandidatesCollection = collection(room, "callerCandidates");

    peerRef.current!.onicecandidate = async (event) => {
      if (!event.candidate) {
        console.log("ICE gathering completed!");
        return;
      }
      //send ice candidates to firebase
      await addDoc(callerCandidatesCollection, event.candidate.toJSON());
    };

    const offer = await peerRef.current!.createOffer();

    await peerRef.current!.setLocalDescription(offer);
    console.log(peerRef.current?.iceGatheringState);
    await setDoc(room, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
      callEnded: false,
    });
    const calleeCandidatesCollection = collection(room, "calleeCandidates");

    onSnapshot(calleeCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          await peerRef.current?.addIceCandidate(
            new RTCIceCandidate(change.doc.data()),
          );
        }
      });
    });

    onSnapshot(room, async (snapshot) => {
      const data = snapshot.data();

      if (data?.answer && !peerRef.current?.currentRemoteDescription) {
        await peerRef.current?.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
        console.log("Answer received");
      }
      if (data?.callEnded) {
        toast.error("Call Ended");

        peerRef.current?.close();
        localStreamRef.current?.getTracks().forEach((track) => track.stop());

        peerRef.current = null;
        localStreamRef.current = null;

        setRemoteJoined(false);

        navigate("/");
      }
    });
  };

  //Hang UP
  const hangup = async () => {
    if (roomRef.current) {
      await updateDoc(roomRef.current, {
        callEnded: true,
      });
    }
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    peerRef.current = null;
    localStreamRef.current = null;

    setRemoteJoined(false);

    toast("Call Ended!!");
    console.log("Call ended");

    navigate("/");
  };

  //JOIN ROOM
  const joinCall = async (roomId: string) => {
    await initializePeer();

    // const roomRef = doc(db, "calls", roomId);
    const room = doc(db, "calls", roomId);
    roomRef.current = room;

    const roomSnapshot = await getDoc(room);

    if (!roomSnapshot.exists()) {
      toast.error("Room does not exist");
      return;
    }
    const roomData = roomSnapshot.data();

    await peerRef.current!.setRemoteDescription(
      new RTCSessionDescription(roomData.offer),
    );

    const calleeCandidates = collection(room, "calleeCandidates");

    peerRef.current!.onicecandidate = async (event) => {
      if (!event.candidate) return;

      await addDoc(calleeCandidates, event.candidate.toJSON());
    };

    const answer = await peerRef.current!.createAnswer();

    await peerRef.current!.setLocalDescription(answer);

    await updateDoc(room, {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    });

    onSnapshot(room, (snapshot) => {
      const data = snapshot.data();

      if (data?.callEnded) {
        // toast.error("Call Ended");

        peerRef.current?.close();
        localStreamRef.current?.getTracks().forEach((track) => track.stop());

        peerRef.current = null;
        localStreamRef.current = null;

        setRemoteJoined(false);

        navigate("/");
      }
    });
    const callerCandidates = collection(room, "callerCandidates");

    onSnapshot(callerCandidates, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          await peerRef.current?.addIceCandidate(
            new RTCIceCandidate(change.doc.data()),
          );
        }
      });
    });
    console.log("Joining room:", roomId);
  };

  return {
    hangup,
    joinCall,
    createCall,
    remoteJoined,
    remoteAudioRef,
    microphones,
    selectedMic,
    setSelectedMic,
  };
}
