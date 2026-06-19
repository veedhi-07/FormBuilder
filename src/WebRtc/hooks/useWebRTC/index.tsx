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
import { db } from "../../firebase";
import toast from "react-hot-toast";

export default function useWebRTC() {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef(new MediaStream());
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [roomId, setRoomId] = useState("");

  const startMicrophone = async () => {
    // console.log("Starting microphone...");
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    peerRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    console.log("Peer connection created");

    localStreamRef.current.getTracks().forEach((track) => {
      //addtrack:  method of the RTCPeerConnection interface adds a new media track to the set of tracks which will be transmitted to the other peer.
      peerRef.current?.addTrack(track, localStreamRef.current!);
    });

    //the track event is sent to ontrack event handler on RTCPeerConnection after a new track has been added to an RTCRtpReceiver which is part of connection.
    peerRef.current.ontrack = async (event) => {
      console.log("TRACK RECEIVED");
      if (remoteAudioRef.current) {
        //attach remote audio stream to <audio> tag
        //webrtc gives live mediaStream not an MP3 file so browser provides audio.drcObject which accepts media stream instead of string url.
        //since onl one stream get that stream so 0.
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };
  };
  const createRoom = async () => {
    // console.log("Create room clicked");
    // console.log(peerRef.current);
    if (!peerRef.current) {
      toast.error("Start Microphone First");
      console.log("No Peer Connection");
      return;
    }

    const roomRef = doc(collection(db, "calls"));
    // * The **`createOffer()`** method of the RTCPeerConnection interface initiates the creation of an SDP offer for the purpose of starting a new WebRTC connection to a remote peer.
    // console.log("Room Created", roomRef.id);

    setRoomId(roomRef.id);

    //sub collaction for network candidates.
    const callerCandidatesCollection = collection(roomRef, "callerCandidates");

    //triggered when browser finds network route
    peerRef.current.onicecandidate = async (event) => {
      if (!event.candidate) return;
      //send ice candidates to firebase.
      await addDoc(callerCandidatesCollection, event.candidate.toJSON());
    };
//  * The **`createOffer()`** method of the RTCPeerConnection interface initiates the creation of an SDP offer for the purpose of starting a new WebRTC connection to a remote peer.
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    console.log(peerRef.current?.iceGatheringState);

    await setDoc(roomRef, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });

    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

    onSnapshot(calleeCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        //changes can be added, modified or removed.
        if (change.type === "added") {
          //convert firestore data to webrtc ice object
          const candidate = new RTCIceCandidate(change.doc.data());
          //add candidate to connection
          await peerRef.current?.addIceCandidate(candidate);
          // console.log("Callee ICE added");
        }
      });
    });

    onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !peerRef.current?.currentRemoteDescription) {
        await peerRef.current?.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
        console.log("Answer Received");
      }
    });
  };

  //Hang UP
  const hangup = () => {
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    // console.log("CALL ENDED");
    toast.error("Call Ended!!");
  };

  //JOIN ROOM
  const joinRoom = async () => {
    if (!peerRef.current) {
      toast.error("Start Microphone First");
      console.log("Start microphone first");
      return;
    }
    if (!roomId) {
      toast.error("Enter Room ID!!");
      // console.log("Enter room id");
      return;
    }

    const roomRef = doc(db, "calls", roomId);

    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists()) {
      console.log("Room does not exist");
      return;
    }

    const roomData = roomSnapshot.data();
    console.log("Offer received", roomData);
    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(roomData.offer),
    );

    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

    peerRef.current.onicecandidate = async (event) => {
      if (!event.candidate) {
        console.log("ICE GAthering complete");
        return;
      }
      await addDoc(calleeCandidatesCollection, event.candidate.toJSON());
    };

    const answer = await peerRef.current.createAnswer();

    await peerRef.current.setLocalDescription(answer);
    await updateDoc(roomRef, {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    });

    console.log("Answer sent");

    const callerCandidatesCollection = collection(roomRef, "callerCandidates");

    onSnapshot(callerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());

          await peerRef.current?.addIceCandidate(candidate);
          console.log("Caller ICE added");
        }
      });
    });
  };

  return {
    roomId,
    setRoomId,
    createRoom,
    hangup,
    joinRoom,
    startMicrophone,
    remoteAudioRef,
  };
}
