import { createHmac } from "crypto";
import { conf } from "../../core/config";

export function hashPinForLookup(pin: string): string {
    return createHmac("sha256", conf.PIN_LOOKUP_SECRET).update(pin).digest("hex");
}
