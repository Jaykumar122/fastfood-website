import { Client } from "@stomp/stompjs";
import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { endpoints } from "../api/endpoints";
import { USE_MOCKS } from "../api/services";

export default function useOrderSocket(orderId) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (USE_MOCKS || !orderId) return undefined;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}${endpoints.websocket}`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/orders/${orderId}`, (message) => {
          setStatus(JSON.parse(message.body).status);
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [orderId]);

  return status;
}
