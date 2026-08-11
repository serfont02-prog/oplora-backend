"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardController = void 0;
var common_1 = require("@nestjs/common");
var jwt_guard_1 = require("../auth/jwt.guard");
var FlashcardController = function () {
    var _classDecorators = [(0, common_1.Controller)('flashcards'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _importar_decorators;
    var _getStatsTema_decorators;
    var _findByArticulo_decorators;
    var _findByTema_decorators;
    var _findByOposicion_decorators;
    var _getPendientes_decorators;
    var _registrarRespuesta_decorators;
    var _programarRepaso_decorators;
    var _sugerirRepaso_decorators;
    var _crearDuelo_decorators;
    var _enviarFC_decorators;
    var _completarReto_decorators;
    var _getStats_decorators;
    var FlashcardController = _classThis = /** @class */ (function () {
        function FlashcardController_1(service) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
        }
        FlashcardController_1.prototype.importar = function (flashcards) {
            return this.service.importar(flashcards);
        };
        FlashcardController_1.prototype.getStatsTema = function (oposicionId, temaId, req) {
            return this.service.getEstadisticasFCTema(req.user.id, oposicionId, temaId);
        };
        FlashcardController_1.prototype.findByArticulo = function (articuloId) {
            return this.service.findByArticulo(articuloId);
        };
        FlashcardController_1.prototype.findByTema = function (temaId) {
            return this.service.findByTema(temaId);
        };
        FlashcardController_1.prototype.findByOposicion = function (oposicionId) {
            return this.service.findByOposicion(oposicionId);
        };
        FlashcardController_1.prototype.getPendientes = function (oposicionId, limite, req) {
            return this.service.getPendientesRepaso(req.user.id, oposicionId, limite ? Number(limite) : 10);
        };
        FlashcardController_1.prototype.registrarRespuesta = function (flashcardId, calificacion, tiempoMs, req) {
            return this.service.registrarRespuesta(req.user.id, flashcardId, calificacion, tiempoMs);
        };
        FlashcardController_1.prototype.programarRepaso = function (articuloId, cuando, oposicionId, req) {
            return this.service.programarRepasoArticulo(req.user.id, articuloId, cuando);
        };
        FlashcardController_1.prototype.sugerirRepaso = function (articuloId, oposicionId, req) {
            return this.service.sugerirRepasoArticulo(req.user.id, articuloId, oposicionId);
        };
        FlashcardController_1.prototype.crearDuelo = function (retadoNickOEmail, oposicionId, numFC, req) {
            return this.service.crearDueloFC(req.user.id, retadoNickOEmail, oposicionId, numFC !== null && numFC !== void 0 ? numFC : 5);
        };
        FlashcardController_1.prototype.enviarFC = function (destinatarioId, flashcardId, mensaje, req) {
            return this.service.enviarFCPersonal(req.user.id, destinatarioId, flashcardId, mensaje);
        };
        FlashcardController_1.prototype.completarReto = function (id, respuestas, req) {
            return this.service.completarRetoFC(id, req.user.id, respuestas);
        };
        FlashcardController_1.prototype.getStats = function (oposicionId, req) {
            return this.service.getEstadisticasFC(req.user.id, oposicionId);
        };
        return FlashcardController_1;
    }());
    __setFunctionName(_classThis, "FlashcardController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _importar_decorators = [(0, common_1.Post)('importar')];
        _getStatsTema_decorators = [(0, common_1.Get)('stats/:oposicionId/:temaId')];
        _findByArticulo_decorators = [(0, common_1.Get)('articulo/:articuloId')];
        _findByTema_decorators = [(0, common_1.Get)('tema/:temaId')];
        _findByOposicion_decorators = [(0, common_1.Get)('oposicion/:oposicionId')];
        _getPendientes_decorators = [(0, common_1.Get)('pendientes/:oposicionId')];
        _registrarRespuesta_decorators = [(0, common_1.Post)('respuesta')];
        _programarRepaso_decorators = [(0, common_1.Post)('programar-repaso')];
        _sugerirRepaso_decorators = [(0, common_1.Post)('sugerir-repaso')];
        _crearDuelo_decorators = [(0, common_1.Post)('duelo')];
        _enviarFC_decorators = [(0, common_1.Post)('enviar')];
        _completarReto_decorators = [(0, common_1.Post)('reto/:id/completar')];
        _getStats_decorators = [(0, common_1.Get)('stats/:oposicionId')];
        __esDecorate(_classThis, null, _importar_decorators, { kind: "method", name: "importar", static: false, private: false, access: { has: function (obj) { return "importar" in obj; }, get: function (obj) { return obj.importar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStatsTema_decorators, { kind: "method", name: "getStatsTema", static: false, private: false, access: { has: function (obj) { return "getStatsTema" in obj; }, get: function (obj) { return obj.getStatsTema; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByArticulo_decorators, { kind: "method", name: "findByArticulo", static: false, private: false, access: { has: function (obj) { return "findByArticulo" in obj; }, get: function (obj) { return obj.findByArticulo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByTema_decorators, { kind: "method", name: "findByTema", static: false, private: false, access: { has: function (obj) { return "findByTema" in obj; }, get: function (obj) { return obj.findByTema; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByOposicion_decorators, { kind: "method", name: "findByOposicion", static: false, private: false, access: { has: function (obj) { return "findByOposicion" in obj; }, get: function (obj) { return obj.findByOposicion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPendientes_decorators, { kind: "method", name: "getPendientes", static: false, private: false, access: { has: function (obj) { return "getPendientes" in obj; }, get: function (obj) { return obj.getPendientes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registrarRespuesta_decorators, { kind: "method", name: "registrarRespuesta", static: false, private: false, access: { has: function (obj) { return "registrarRespuesta" in obj; }, get: function (obj) { return obj.registrarRespuesta; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _programarRepaso_decorators, { kind: "method", name: "programarRepaso", static: false, private: false, access: { has: function (obj) { return "programarRepaso" in obj; }, get: function (obj) { return obj.programarRepaso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sugerirRepaso_decorators, { kind: "method", name: "sugerirRepaso", static: false, private: false, access: { has: function (obj) { return "sugerirRepaso" in obj; }, get: function (obj) { return obj.sugerirRepaso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _crearDuelo_decorators, { kind: "method", name: "crearDuelo", static: false, private: false, access: { has: function (obj) { return "crearDuelo" in obj; }, get: function (obj) { return obj.crearDuelo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _enviarFC_decorators, { kind: "method", name: "enviarFC", static: false, private: false, access: { has: function (obj) { return "enviarFC" in obj; }, get: function (obj) { return obj.enviarFC; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _completarReto_decorators, { kind: "method", name: "completarReto", static: false, private: false, access: { has: function (obj) { return "completarReto" in obj; }, get: function (obj) { return obj.completarReto; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FlashcardController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FlashcardController = _classThis;
}();
exports.FlashcardController = FlashcardController;
