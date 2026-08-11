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
exports.BoeController = void 0;
var common_1 = require("@nestjs/common");
var jwt_guard_1 = require("../auth/jwt.guard");
var BoeController = function () {
    var _classDecorators = [(0, common_1.Controller)('boe'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _consultar_decorators;
    var _tareasPendientes_decorators;
    var _extraerTemario_decorators;
    var _compararTemarios_decorators;
    var _procesar_decorators;
    var _guardar_decorators;
    var _extraerDatos_decorators;
    var _getPendientes_decorators;
    var _getAll_decorators;
    var _aprobar_decorators;
    var _rechazar_decorators;
    var _guardarDatos_decorators;
    var BoeController = _classThis = /** @class */ (function () {
        function BoeController_1(service) {
            this.service = (__runInitializers(this, _instanceExtraInitializers), service);
        }
        BoeController_1.prototype.consultar = function (fecha) {
            return this.service.consultarFecha(fecha);
        };
        BoeController_1.prototype.tareasPendientes = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.service.getTareasPendientes()];
                });
            });
        };
        BoeController_1.prototype.extraerTemario = function (id) {
            return this.service.extraerTemarioYCaracteristicas(id);
        };
        BoeController_1.prototype.compararTemarios = function (body) {
            return this.service.compararTemarios(body.temasNuevos, body.temasAnteriores);
        };
        BoeController_1.prototype.procesar = function (id, oposicionExistenteId) {
            return this.service.procesarConvocatoria(id, oposicionExistenteId);
        };
        BoeController_1.prototype.guardar = function (datos) {
            return this.service.guardarConvocatoria(datos);
        };
        BoeController_1.prototype.extraerDatos = function (id) {
            return this.service.extraerDatosPDF(id);
        };
        BoeController_1.prototype.getPendientes = function () {
            return this.service.getPendientes();
        };
        BoeController_1.prototype.getAll = function () {
            return this.service.getAll();
        };
        BoeController_1.prototype.aprobar = function (id) {
            return this.service.aprobar(id);
        };
        BoeController_1.prototype.rechazar = function (id, notas) {
            return this.service.rechazar(id, notas);
        };
        BoeController_1.prototype.guardarDatos = function (id, datos) {
            return this.service.guardarDatosExtraidos(id, datos);
        };
        return BoeController_1;
    }());
    __setFunctionName(_classThis, "BoeController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _consultar_decorators = [(0, common_1.Get)('consultar')];
        _tareasPendientes_decorators = [(0, common_1.Get)('tareas-pendientes')];
        _extraerTemario_decorators = [(0, common_1.Post)(':id/extraer-temario')];
        _compararTemarios_decorators = [(0, common_1.Post)('comparar-temarios')];
        _procesar_decorators = [(0, common_1.Post)(':id/procesar')];
        _guardar_decorators = [(0, common_1.Post)('guardar')];
        _extraerDatos_decorators = [(0, common_1.Post)(':id/extraer')];
        _getPendientes_decorators = [(0, common_1.Get)('pendientes')];
        _getAll_decorators = [(0, common_1.Get)()];
        _aprobar_decorators = [(0, common_1.Patch)(':id/aprobar')];
        _rechazar_decorators = [(0, common_1.Patch)(':id/rechazar')];
        _guardarDatos_decorators = [(0, common_1.Patch)(':id/datos')];
        __esDecorate(_classThis, null, _consultar_decorators, { kind: "method", name: "consultar", static: false, private: false, access: { has: function (obj) { return "consultar" in obj; }, get: function (obj) { return obj.consultar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _tareasPendientes_decorators, { kind: "method", name: "tareasPendientes", static: false, private: false, access: { has: function (obj) { return "tareasPendientes" in obj; }, get: function (obj) { return obj.tareasPendientes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _extraerTemario_decorators, { kind: "method", name: "extraerTemario", static: false, private: false, access: { has: function (obj) { return "extraerTemario" in obj; }, get: function (obj) { return obj.extraerTemario; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _compararTemarios_decorators, { kind: "method", name: "compararTemarios", static: false, private: false, access: { has: function (obj) { return "compararTemarios" in obj; }, get: function (obj) { return obj.compararTemarios; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _procesar_decorators, { kind: "method", name: "procesar", static: false, private: false, access: { has: function (obj) { return "procesar" in obj; }, get: function (obj) { return obj.procesar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _guardar_decorators, { kind: "method", name: "guardar", static: false, private: false, access: { has: function (obj) { return "guardar" in obj; }, get: function (obj) { return obj.guardar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _extraerDatos_decorators, { kind: "method", name: "extraerDatos", static: false, private: false, access: { has: function (obj) { return "extraerDatos" in obj; }, get: function (obj) { return obj.extraerDatos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPendientes_decorators, { kind: "method", name: "getPendientes", static: false, private: false, access: { has: function (obj) { return "getPendientes" in obj; }, get: function (obj) { return obj.getPendientes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAll_decorators, { kind: "method", name: "getAll", static: false, private: false, access: { has: function (obj) { return "getAll" in obj; }, get: function (obj) { return obj.getAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _aprobar_decorators, { kind: "method", name: "aprobar", static: false, private: false, access: { has: function (obj) { return "aprobar" in obj; }, get: function (obj) { return obj.aprobar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _rechazar_decorators, { kind: "method", name: "rechazar", static: false, private: false, access: { has: function (obj) { return "rechazar" in obj; }, get: function (obj) { return obj.rechazar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _guardarDatos_decorators, { kind: "method", name: "guardarDatos", static: false, private: false, access: { has: function (obj) { return "guardarDatos" in obj; }, get: function (obj) { return obj.guardarDatos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BoeController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BoeController = _classThis;
}();
exports.BoeController = BoeController;
