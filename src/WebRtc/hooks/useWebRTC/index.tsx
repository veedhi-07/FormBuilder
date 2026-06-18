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
    // const track = localStreamRef.current?.getAudioTracks()[0];

    // console.log("enabled:", track?.enabled);
    // console.log("muted:", track?.muted);
    // console.log("readyState:", track?.readyState);

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
        remoteAudioRef.current.srcObject = event.streams[0];

        // try {
        //   await remoteAudioRef.current.play();
        //   console.log("Audio Playing");
        // } catch (err) {
        //   console.log("Play failed", err);
        // }
        // DEBUG AUDIO STATS
        // setInterval(async () => {
        //   const stats = await peerRef.current?.getStats();

        //   stats?.forEach((report) => {
        //     if (report.type === "inbound-rtp" && report.kind === "audio") {
        //       console.log({
        //         packetsReceived: report.packetsReceived,
        //         bytesReceived: report.bytesReceived,
        //       });
        //     }
        //   });
        // }, 3000);
        console.log("srcObject:", remoteAudioRef.current.srcObject);
        // console.log("srcObject:", remoteAudioRef.current.srcObject);
      }
    };
  };

  const createRoom = async () => {
    console.log("Create room clicked");
    console.log(peerRef.current);
    if (!peerRef.current) {
      console.log("No Peer Connection");
      return;
    }

    const roomRef = doc(collection(db, "calls"));

    const offer = await peerRef.current.createOffer();

    await peerRef.current.setLocalDescription(offer);

    await setDoc(roomRef, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });
    console.log("Room Created", roomRef.id);

    setRoomId(roomRef.id);

    const callerCandidatesCollection = collection(roomRef, "callerCandidates");

    peerRef.current.onicecandidate = async (event) => {
      if (!event.candidate) return;

      await addDoc(callerCandidatesCollection, event.candidate.toJSON());
    };
    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

    onSnapshot(calleeCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());

          await peerRef.current?.addIceCandidate(candidate);

          console.log("Callee ICE added");
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

  const hangup = () => {
    peerRef.current?.close();

    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    remoteStreamRef.current.getTracks().forEach((track) => track.stop());
  };
  const joinRoom = async () => {
    if (!peerRef.current) {
      console.log("Start microphone first");
      return;
    }

    if (!roomId) {
      console.log("Enter room id");
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
      if (!event.candidate) return;

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
