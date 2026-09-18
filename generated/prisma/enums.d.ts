export declare const Role: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly STAFF: "STAFF";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly BLOCKED: "BLOCKED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
