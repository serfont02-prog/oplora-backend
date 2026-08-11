"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeyModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var ley_entity_1 = require("./ley.entity");
var version_ley_entity_1 = require("./version-ley.entity");
var diff_version_entity_1 = require("./diff-version.entity");
var oposicion_ley_entity_1 = require("./oposicion-ley.entity");
var ley_service_1 = require("./ley.service");
var ley_controller_1 = require("./ley.controller");
var parseo_service_1 = require("./parseo.service");
var ia_module_1 = require("../ia/ia.module");
var platform_express_1 = require("@nestjs/platform-express");
var multer_1 = require("multer");
var path_1 = require("path");
var titulo_entity_1 = require("../normativa/titulo.entity");
var capitulo_entity_1 = require("../normativa/capitulo.entity");
var articulo_entity_1 = require("../normativa/articulo.entity");
var seccion_entity_1 = require("../normativa/seccion.entity");
var libro_entity_1 = require("../normativa/libro.entity");
var LeyModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([
                    ley_entity_1.Ley, version_ley_entity_1.VersionLey, diff_version_entity_1.DiffVersion, oposicion_ley_entity_1.OposicionLey,
                    titulo_entity_1.Titulo, capitulo_entity_1.Capitulo, articulo_entity_1.Articulo, seccion_entity_1.Seccion, libro_entity_1.Libro,
                ]),
                ia_module_1.IaModule,
                platform_express_1.MulterModule.register({
                    storage: (0, multer_1.diskStorage)({
                        destination: './uploads',
                        filename: function (_, file, cb) {
                            var unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                            cb(null, unique + (0, path_1.extname)(file.originalname));
                        },
                    }),
                    fileFilter: function (_, file, cb) {
                        var allowed = ['.pdf', '.txt'];
                        var ext = (0, path_1.extname)(file.originalname).toLowerCase();
                        cb(null, allowed.includes(ext));
                    },
                    limits: { fileSize: 50 * 1024 * 1024 },
                }),
            ],
            controllers: [ley_controller_1.LeyController],
            providers: [ley_service_1.LeyService, parseo_service_1.ParseoService],
            exports: [ley_service_1.LeyService, parseo_service_1.ParseoService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LeyModule = _classThis = /** @class */ (function () {
        function LeyModule_1() {
        }
        return LeyModule_1;
    }());
    __setFunctionName(_classThis, "LeyModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LeyModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LeyModule = _classThis;
}();
exports.LeyModule = LeyModule;
