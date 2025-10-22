import { Server } from 'socket.io';
interface ISocketUser {
    [userId: string]: string;
}
export declare const setupSocketHandlers: (io: Server) => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getOnlineUsers: () => ISocketUser;
export declare const isUserOnline: (userId: string) => boolean;
export {};
//# sourceMappingURL=socketHandlers.d.ts.map