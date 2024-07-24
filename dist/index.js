"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOutgoingRelationships = exports.findIncomingRelationships = exports.relationshipsPlugin = void 0;
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "relationshipsPlugin", { enumerable: true, get: function () { return plugin_1.relationshipsPlugin; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "findIncomingRelationships", { enumerable: true, get: function () { return utils_1.findIncomingRelationships; } });
Object.defineProperty(exports, "findOutgoingRelationships", { enumerable: true, get: function () { return utils_1.findOutgoingRelationships; } });
