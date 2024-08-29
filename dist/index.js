"use strict";
// Notice:
// adapted from [@instantdb/react](https://github.com/instantdb/instant/blob/main/client/packages/react/README.md)
// see instantdb-license.md for license
Object.defineProperty(exports, "__esModule", { value: true });
exports.i = exports.InstantVue = exports.init = exports.lookup = exports.tx = exports.id = void 0;
const core_1 = require("@instantdb/core");
Object.defineProperty(exports, "id", { enumerable: true, get: function () { return core_1.id; } });
Object.defineProperty(exports, "tx", { enumerable: true, get: function () { return core_1.tx; } });
Object.defineProperty(exports, "lookup", { enumerable: true, get: function () { return core_1.lookup; } });
Object.defineProperty(exports, "i", { enumerable: true, get: function () { return core_1.i; } });
const InstantVue_1 = require("./InstantVue");
Object.defineProperty(exports, "InstantVue", { enumerable: true, get: function () { return InstantVue_1.InstantVue; } });
const init_1 = require("./init");
Object.defineProperty(exports, "init", { enumerable: true, get: function () { return init_1.init; } });
//# sourceMappingURL=index.js.map