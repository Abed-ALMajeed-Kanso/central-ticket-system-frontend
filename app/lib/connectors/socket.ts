import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

export interface SubscriptionConfig {
  topic: string;
  callback: (msg: IMessage) => void;
}

export const createStompClient = (subscriptions: SubscriptionConfig[]) => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

  const socket = new SockJS(wsUrl);

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    subscriptions.forEach((sub) => {
      client.subscribe(sub.topic, sub.callback);
    });
  };

  client.activate();
  return client; 
};
