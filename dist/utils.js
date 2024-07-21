"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOutcomingRelationships = exports.findIncomingRelationships = exports.findRelationByID = exports.getRelationId = void 0;
const payload_1 = __importDefault(require("payload"));
const getRelationId = (collection, id) => `${collection}_${id}`;
exports.getRelationId = getRelationId;
const findRelationByID = (collection, id) => {
    return payload_1.default.findByID({
        collection: "relationships",
        id: (0, exports.getRelationId)(collection, id),
    });
};
exports.findRelationByID = findRelationByID;
const findIncomingRelationships = (collection, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { incomingRelations } = yield (0, exports.findRelationByID)(collection, id);
        return incomingRelations;
    }
    catch (_a) {
        return [];
    }
});
exports.findIncomingRelationships = findIncomingRelationships;
const findOutcomingRelationships = (collection, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { outgoingRelations } = yield (0, exports.findRelationByID)(collection, id);
        return outgoingRelations;
    }
    catch (_b) {
        return [];
    }
});
exports.findOutcomingRelationships = findOutcomingRelationships;
