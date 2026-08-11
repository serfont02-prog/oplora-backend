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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemaController = void 0;
var common_1 = require("@nestjs/common");
var platform_express_1 = require("@nestjs/platform-express");
var jwt_guard_1 = require("../auth/jwt.guard");
var TemaController = function () {
    var _classDecorators = [(0, common_1.Controller)('temas')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findByOposicion_decorators;
    var _findOne_decorators;
    var _getArticulos_decorators;
    var _getPreguntasBanco_decorators;
    var _findByConvocatoria_decorators;
    var _getExamenesByConvocatoria_decorators;
    var _subirExamenConvocatoria_decorators;
    var _eliminarExamen_decorators;
    var _procesarExamenConvocatoria_decorators;
    var _crear_decorators;
    var _actualizar_decorators;
    var _eliminar_decorators;
    var _vincularNormativa_decorators;
    var _registrarSesion_decorators;
    var _getEstadisticasSesion_decorators;
    var _desvincularNormativa_decorators;
    var _guardarPregunta_decorators;
    var _subirExamen_decorators;
    var _procesarExamen_decorators;
    var _subirApunte_decorators;
    var _getApuntes_decorators;
    var TemaController = _classThis = /** @class */ (function () {
        function TemaController_1(service) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
        }
        TemaController_1.prototype.findByOposicion = function (oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Mantener por compatibilidad — busca convocatoria activa y devuelve sus temas
                    return [2 /*return*/, this.service.findByOposicion(oposicionId)];
                });
            });
        };
        TemaController_1.prototype.findOne = function (id) {
            return this.service.findOne(id);
        };
        TemaController_1.prototype.getArticulos = function (id) {
            return this.service.getArticulosDeTema(id);
        };
        TemaController_1.prototype.getPreguntasBanco = function (id) {
            return this.service.getPreguntasBanco(id);
        };
        TemaController_1.prototype.findByConvocatoria = function (convocatoriaId) {
            return this.service.findByConvocatoria(convocatoriaId);
        };
        TemaController_1.prototype.getExamenesByConvocatoria = function (convocatoriaId) {
            return this.service.getExamenesByConvocatoria(convocatoriaId);
        };
        TemaController_1.prototype.subirExamenConvocatoria = function (convocatoriaId, file, nombre, anyo, tipo, mes) {
            return this.service.subirExamenConvocatoria(convocatoriaId, nombre, parseInt(anyo), tipo, mes, file.path);
        };
        TemaController_1.prototype.eliminarExamen = function (examenId) {
            return this.service.eliminarExamen(examenId);
        };
        TemaController_1.prototype.procesarExamenConvocatoria = function (examenId) {
            return this.service.procesarExamen(examenId);
        };
        TemaController_1.prototype.crear = function (body) {
            return this.service.crear(body);
        };
        TemaController_1.prototype.actualizar = function (id, body) {
            return this.service.actualizar(id, body);
        };
        TemaController_1.prototype.eliminar = function (id) {
            return this.service.eliminar(id);
        };
        TemaController_1.prototype.vincularNormativa = function (id, body) {
            return this.service.vincularNormativa(id, body);
        };
        TemaController_1.prototype.registrarSesion = function (id, req) {
            return this.service.registrarSesion(req.user.id, id);
        };
        TemaController_1.prototype.getEstadisticasSesion = function (id, req) {
            return this.service.getEstadisticasSesion(req.user.id, id);
        };
        TemaController_1.prototype.desvincularNormativa = function (id) {
            return this.service.desvincularNormativa(id);
        };
        TemaController_1.prototype.guardarPregunta = function (body) {
            return this.service.guardarPreguntaBanco(body);
        };
        TemaController_1.prototype.subirExamen = function (file, oposicionId, anyo) {
            return this.service.subirExamen(oposicionId, parseInt(anyo), file.path);
        };
        TemaController_1.prototype.procesarExamen = function (id) {
            return this.service.procesarExamen(id);
        };
        TemaController_1.prototype.subirApunte = function (file, oposicionId, nombre, req) {
            return this.service.subirApunte(req.user.id, oposicionId, nombre, file.path);
        };
        TemaController_1.prototype.getApuntes = function (oposicionId, req) {
            return this.service.getApuntesUsuario(req.user.id, oposicionId);
        };
        return TemaController_1;
    }());
    __setFunctionName(_classThis, "TemaController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findByOposicion_decorators = [(0, common_1.Get)('oposicion/:oposicionId')];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _getArticulos_decorators = [(0, common_1.Get)(':id/articulos')];
        _getPreguntasBanco_decorators = [(0, common_1.Get)(':id/preguntas-banco')];
        _findByConvocatoria_decorators = [(0, common_1.Get)('convocatoria/:convocatoriaId')];
        _getExamenesByConvocatoria_decorators = [(0, common_1.Get)('examenes/convocatoria/:convocatoriaId')];
        _subirExamenConvocatoria_decorators = [(0, common_1.Post)('examenes/convocatoria/:convocatoriaId'), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo'))];
        _eliminarExamen_decorators = [(0, common_1.Delete)('examenes/:examenId')];
        _procesarExamenConvocatoria_decorators = [(0, common_1.Post)('examenes/:examenId/procesar')];
        _crear_decorators = [(0, common_1.Post)()];
        _actualizar_decorators = [(0, common_1.Patch)(':id')];
        _eliminar_decorators = [(0, common_1.Delete)(':id')];
        _vincularNormativa_decorators = [(0, common_1.Post)(':id/normativa')];
        _registrarSesion_decorators = [(0, common_1.Post)(':id/sesion'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT)];
        _getEstadisticasSesion_decorators = [(0, common_1.Get)(':id/sesion'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _desvincularNormativa_decorators = [(0, common_1.Delete)('normativa/:temaNormativaId')];
        _guardarPregunta_decorators = [(0, common_1.Post)('preguntas-banco')];
        _subirExamen_decorators = [(0, common_1.Post)('examen/subir'), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo'))];
        _procesarExamen_decorators = [(0, common_1.Post)('examen/:id/procesar')];
        _subirApunte_decorators = [(0, common_1.Post)('apuntes/subir'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo'))];
        _getApuntes_decorators = [(0, common_1.Get)('apuntes/usuario/:oposicionId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _findByOposicion_decorators, { kind: "method", name: "findByOposicion", static: false, private: false, access: { has: function (obj) { return "findByOposicion" in obj; }, get: function (obj) { return obj.findByOposicion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getArticulos_decorators, { kind: "method", name: "getArticulos", static: false, private: false, access: { has: function (obj) { return "getArticulos" in obj; }, get: function (obj) { return obj.getArticulos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPreguntasBanco_decorators, { kind: "method", name: "getPreguntasBanco", static: false, private: false, access: { has: function (obj) { return "getPreguntasBanco" in obj; }, get: function (obj) { return obj.getPreguntasBanco; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByConvocatoria_decorators, { kind: "method", name: "findByConvocatoria", static: false, private: false, access: { has: function (obj) { return "findByConvocatoria" in obj; }, get: function (obj) { return obj.findByConvocatoria; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getExamenesByConvocatoria_decorators, { kind: "method", name: "getExamenesByConvocatoria", static: false, private: false, access: { has: function (obj) { return "getExamenesByConvocatoria" in obj; }, get: function (obj) { return obj.getExamenesByConvocatoria; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _subirExamenConvocatoria_decorators, { kind: "method", name: "subirExamenConvocatoria", static: false, private: false, access: { has: function (obj) { return "subirExamenConvocatoria" in obj; }, get: function (obj) { return obj.subirExamenConvocatoria; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _eliminarExamen_decorators, { kind: "method", name: "eliminarExamen", static: false, private: false, access: { has: function (obj) { return "eliminarExamen" in obj; }, get: function (obj) { return obj.eliminarExamen; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _procesarExamenConvocatoria_decorators, { kind: "method", name: "procesarExamenConvocatoria", static: false, private: false, access: { has: function (obj) { return "procesarExamenConvocatoria" in obj; }, get: function (obj) { return obj.procesarExamenConvocatoria; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _crear_decorators, { kind: "method", name: "crear", static: false, private: false, access: { has: function (obj) { return "crear" in obj; }, get: function (obj) { return obj.crear; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _actualizar_decorators, { kind: "method", name: "actualizar", static: false, private: false, access: { has: function (obj) { return "actualizar" in obj; }, get: function (obj) { return obj.actualizar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _eliminar_decorators, { kind: "method", name: "eliminar", static: false, private: false, access: { has: function (obj) { return "eliminar" in obj; }, get: function (obj) { return obj.eliminar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _vincularNormativa_decorators, { kind: "method", name: "vincularNormativa", static: false, private: false, access: { has: function (obj) { return "vincularNormativa" in obj; }, get: function (obj) { return obj.vincularNormativa; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registrarSesion_decorators, { kind: "method", name: "registrarSesion", static: false, private: false, access: { has: function (obj) { return "registrarSesion" in obj; }, get: function (obj) { return obj.registrarSesion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getEstadisticasSesion_decorators, { kind: "method", name: "getEstadisticasSesion", static: false, private: false, access: { has: function (obj) { return "getEstadisticasSesion" in obj; }, get: function (obj) { return obj.getEstadisticasSesion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _desvincularNormativa_decorators, { kind: "method", name: "desvincularNormativa", static: false, private: false, access: { has: function (obj) { return "desvincularNormativa" in obj; }, get: function (obj) { return obj.desvincularNormativa; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _guardarPregunta_decorators, { kind: "method", name: "guardarPregunta", static: false, private: false, access: { has: function (obj) { return "guardarPregunta" in obj; }, get: function (obj) { return obj.guardarPregunta; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _subirExamen_decorators, { kind: "method", name: "subirExamen", static: false, private: false, access: { has: function (obj) { return "subirExamen" in obj; }, get: function (obj) { return obj.subirExamen; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _procesarExamen_decorators, { kind: "method", name: "procesarExamen", static: false, private: false, access: { has: function (obj) { return "procesarExamen" in obj; }, get: function (obj) { return obj.procesarExamen; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _subirApunte_decorators, { kind: "method", name: "subirApunte", static: false, private: false, access: { has: function (obj) { return "subirApunte" in obj; }, get: function (obj) { return obj.subirApunte; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getApuntes_decorators, { kind: "method", name: "getApuntes", static: false, private: false, access: { has: function (obj) { return "getApuntes" in obj; }, get: function (obj) { return obj.getApuntes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TemaController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TemaController = _classThis;
}();
exports.TemaController = TemaController;
