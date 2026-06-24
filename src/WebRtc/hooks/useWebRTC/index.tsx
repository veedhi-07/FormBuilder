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
        //webrtc provides live mediastream not a url.
        //srcobject accepts mediastream objects so srcobject.
        //since only one stream get that stream so 0.
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };
  };

  //create room
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
    setRoomId(roomRef.id);
    //sub collection for ice network candidates.
    const callerCandidatesCollection = collection(roomRef, "callerCandidates");
    //triggered when browser finds network route
    peerRef.current.onicecandidate = async (event) => {
      if (!event.candidate) {
        console.log("ICE gathering completed!");
        return;
      }
      //send ice candidates to firebase.
      await addDoc(callerCandidatesCollection, event.candidate.toJSON());
    };
    //  * The **`createOffer()`** method of the RTCPeerConnection interface initiates the creation of an SDP offer for the purpose of starting a new WebRTC connection to a remote peer.
    const offer = await peerRef.current.createOffer();
    //  * The **`setLocalDescription()`** method of the RTCPeerConnection interface changes the local description associated with the connection.
    // // This description specifies the properties of the local end of the connection, including the media format. The method takes a single parameter—the session description—and it returns a Promise which is fulfilled once the description has been changed, asynchronously.
    //without this ICE gathering will not start.
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
    toast.error("Call Ended!!");
  };

  //JOIN ROOM
  const joinRoom = async () => {
    if (!peerRef.current) {
      toast.error("Start Microphone First");
      console.log("Start Microphone First");
      return;
    }
    if (!roomId) {
      toast.error("Enter Room ID");
      // console.log("Enter room id");
      return;
    }

    const roomRef = doc(db, "calls", roomId);

    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists()) {
      toast.error("Room does not exist");
      return;
    }
    //set caller offer
    const roomData = roomSnapshot.data();
    console.log("Offer received", roomData);

    //set caller's offer as remote description
    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(roomData.offer),
    );

    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

    //listen for local ice candidates
    peerRef.current.onicecandidate = async (event) => {
      if (!event.candidate) {
        console.log("ICE Gathering completed");
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
    //listen for new caller candidates
    onSnapshot(callerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        //process only new candidates
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
