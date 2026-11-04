
import { Room, RoomEvent, TokenSource } from "livekit-client";

// ELVORA LiveKit development connection
const tokenSource = TokenSource.developmentTokenServer("elvora-18smy1");

export async function connectToLiveKitRoom({
  roomName,
  participantName,
}) {
  if (!roomName || !participantName) {
    throw new Error("Room name and participant name are required.");
  }

  const { serverUrl, participantToken } = await tokenSource.fetch({
    roomName,
    participantName,
  });

  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });

  await room.connect(serverUrl, participantToken);

  return room;
}

export async function enableRoomMicrophone(room) {
  if (!room) {
    throw new Error("Room is not connected.");
  }

  await room.localParticipant.setMicrophoneEnabled(true);
}

export async function disableRoomMicrophone(room) {
  if (!room) return;

  await room.localParticipant.setMicrophoneEnabled(false);
}

export async function disconnectFromLiveKitRoom(room) {
  if (!room) return;

  await room.disconnect();
}

export { RoomEvent };
