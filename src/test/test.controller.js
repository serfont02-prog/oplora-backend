"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.TestController = void 0;
var common_1 = require("@nestjs/common");
var jwt_guard_1 = require("../auth/jwt.guard");
var TestController = function () {
    var _classDecorators = [(0, common_1.Controller)('test')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _generar_decorators;
    var _guardarResultado_decorators;
    var _getProgresoTema_decorators;
    var _getUltimoResultado_decorators;
    var _getProgreso_decorators;
    var _importarPorConvocatoria_decorators;
    var _importarPorVersionLey_decorators;
    var TestController = _classThis = /** @class */ (function () {
        function TestController_1(testService) {
            this.testService = (__runInitializers(this, _instanceExtraInitializers), testService);
        }
        /* =========================================================
           GENERAR TEST
        ========================================================= */
        TestController_1.prototype.generar = function (oposicionId, numPreguntas, temasIds, modo, nivel, dificultad, temaId, versionLeyId, capituloId, tituloId, req) {
            var _a;
            return this.testService.generarTest(oposicionId, numPreguntas !== null && numPreguntas !== void 0 ? numPreguntas : 5, temaId, versionLeyId, capituloId, tituloId, modo, nivel, dificultad, (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id);
        };
        /* =========================================================
           GUARDAR RESULTADO
        ========================================================= */
        TestController_1.prototype.guardarResultado = function (body, req) {
            return this.testService.guardarResultado(__assign(__assign({}, body), { usuarioId: req.user.id }));
        };
        /* =========================================================
           PROGRESO
        ========================================================= */
        TestController_1.prototype.getProgresoTema = function (oposicionId, temaId, req) {
            return this.testService.getProgresoTema(req.user.id, oposicionId, temaId);
        };
        TestController_1.prototype.getUltimoResultado = function (req) {
            return this.testService.getUltimoResultado(req.user.id);
        };
        TestController_1.prototype.getProgreso = function (oposicionId, req) {
            return this.testService.getProgreso(req.user.id, oposicionId);
        };
        TestController_1.prototype.importarPorConvocatoria = function (convocatoriaId, preguntas) {
            return this.testService.importarPorConvocatoria(convocatoriaId, preguntas);
        };
        TestController_1.prototype.importarPorVersionLey = function (versionLeyId, preguntas) {
            return this.testService.importarPorVersionLey(versionLeyId, preguntas);
        };
        return TestController_1;
    }());
    __setFunctionName(_classThis, "TestController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _generar_decorators = [(0, common_1.Post)('generar'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _guardarResultado_decorators = [(0, common_1.Post)('resultado'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _getProgresoTema_decorators = [(0, common_1.Get)('progreso/:oposicionId/:temaId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _getUltimoResultado_decorators = [(0, common_1.Get)('ultimo-resultado'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _getProgreso_decorators = [(0, common_1.Get)('progreso/:oposicionId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _importarPorConvocatoria_decorators = [(0, common_1.Post)('importar/convocatoria/:convocatoriaId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        _importarPorVersionLey_decorators = [(0, common_1.Post)('importar/version-ley/:versionLeyId'), (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _generar_decorators, { kind: "method", name: "generar", static: false, private: false, access: { has: function (obj) { return "generar" in obj; }, get: function (obj) { return obj.generar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _guardarResultado_decorators, { kind: "method", name: "guardarResultado", static: false, private: false, access: { has: function (obj) { return "guardarResultado" in obj; }, get: function (obj) { return obj.guardarResultado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProgresoTema_decorators, { kind: "method", name: "getProgresoTema", static: false, private: false, access: { has: function (obj) { return "getProgresoTema" in obj; }, get: function (obj) { return obj.getProgresoTema; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUltimoResultado_decorators, { kind: "method", name: "getUltimoResultado", static: false, private: false, access: { has: function (obj) { return "getUltimoResultado" in obj; }, get: function (obj) { return obj.getUltimoResultado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProgreso_decorators, { kind: "method", name: "getProgreso", static: false, private: false, access: { has: function (obj) { return "getProgreso" in obj; }, get: function (obj) { return obj.getProgreso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importarPorConvocatoria_decorators, { kind: "method", name: "importarPorConvocatoria", static: false, private: false, access: { has: function (obj) { return "importarPorConvocatoria" in obj; }, get: function (obj) { return obj.importarPorConvocatoria; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importarPorVersionLey_decorators, { kind: "method", name: "importarPorVersionLey", static: false, private: false, access: { has: function (obj) { return "importarPorVersionLey" in obj; }, get: function (obj) { return obj.importarPorVersionLey; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TestController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TestController = _classThis;
}();
exports.TestController = TestController;
