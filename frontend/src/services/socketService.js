import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let subscriptions = {};

const getClient = () => {
  if (stompClient && stompClient.connected) return Promise.resolve(stompClient);

  return new Promise((resolve, reject) => {
    const socket = new SockJS("http://localhost:8080/auction");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient = client;
        resolve(client);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        reject(frame);
      },
    });
    client.activate();
  });
};

// Subscribe to global bid updates (home page)
export const connectSocket = (onMessage) => {
  getClient().then(client => {
    if (subscriptions["global"]) subscriptions["global"].unsubscribe();
    subscriptions["global"] = client.subscribe("/topic/bids", (msg) => {
      try { onMessage(JSON.parse(msg.body)); } catch {}
    });
  }).catch(() => {});
};

// Subscribe to product-specific bid updates (auction room)
export const subscribeToProduct = (productId, onMessage) => {
  getClient().then(client => {
    const key = `product_${productId}`;
    if (subscriptions[key]) subscriptions[key].unsubscribe();
    subscriptions[key] = client.subscribe(`/topic/bids/${productId}`, (msg) => {
      try { onMessage(JSON.parse(msg.body)); } catch {}
    });
  }).catch(() => {});
};

export const subscribeToChat = (productId, onMessage) => {
  getClient().then(client => {
    const key = `chat_${productId}`;
    if (subscriptions[key]) subscriptions[key].unsubscribe();
    subscriptions[key] = client.subscribe(`/topic/chat/${productId}`, (msg) => {
      try { onMessage(JSON.parse(msg.body)); } catch {}
    });
  }).catch(() => {});
};

export const subscribeToDirectChat = (roomId, onMessage) => {
  getClient().then(client => {
    const key = `direct_${roomId}`;
    if (subscriptions[key]) subscriptions[key].unsubscribe();
    subscriptions[key] = client.subscribe(`/topic/chat/direct/${roomId}`, (msg) => {
      try { onMessage(JSON.parse(msg.body)); } catch {}
    });
  }).catch(() => {});
};

export const unsubscribeFromProduct = (productId) => {
  const key = `product_${productId}`;
  if (subscriptions[key]) {
    subscriptions[key].unsubscribe();
    delete subscriptions[key];
  }
};

export const disconnectSocket = () => {
  Object.values(subscriptions).forEach(sub => {
    try { sub.unsubscribe(); } catch {}
  });
  subscriptions = {};
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
