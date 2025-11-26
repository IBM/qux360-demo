import { v7 as uuidv7 } from "uuid";

class UtilsService {
    constructor() {}

    public getUniqueId(): string {
        return uuidv7().toString();
    }
}

export default new UtilsService();
