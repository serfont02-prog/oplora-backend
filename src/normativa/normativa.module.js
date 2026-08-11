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
exports.NormativaModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var titulo_entity_1 = require("./titulo.entity");
var capitulo_entity_1 = require("./capitulo.entity");
var articulo_entity_1 = require("./articulo.entity");
var pregunta_corta_entity_1 = require("./pregunta-corta.entity");
var nota_articulo_entity_1 = require("./nota-articulo.entity");
var subrayado_articulo_entity_1 = require("./subrayado-articulo.entity");
var version_ley_entity_1 = require("../ley/version-ley.entity");
var flashcard_entity_1 = require("../flashcard/flashcard.entity");
var pregunta_banco_entity_1 = require("../tema/pregunta-banco.entity");
var normativa_controller_1 = require("./normativa.controller");
var normativa_service_1 = require("./normativa.service");
var notificacion_module_1 = require("../notificacion/notificacion.module");
var NormativaModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([
                    titulo_entity_1.Titulo, capitulo_entity_1.Capitulo, articulo_entity_1.Articulo, pregunta_corta_entity_1.PreguntaCorta,
                    nota_articulo_entity_1.NotaArticulo, subrayado_articulo_entity_1.SubrayadoArticulo,
                    version_ley_entity_1.VersionLey, flashcard_entity_1.Flashcard, pregunta_banco_entity_1.PreguntaBanco,
                ]),
                notificacion_module_1.NotificacionModule,
            ],
            controllers: [normativa_controller_1.NormativaController],
            providers: [normativa_service_1.NormativaService],
            exports: [normativa_service_1.NormativaService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NormativaModule = _classThis = /** @class */ (function () {
        function NormativaModule_1() {
        }
        return NormativaModule_1;
    }());
    __setFunctionName(_classThis, "NormativaModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NormativaModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NormativaModule = _classThis;
}();
exports.NormativaModule = NormativaModule;
