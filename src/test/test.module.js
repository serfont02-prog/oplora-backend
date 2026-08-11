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
exports.TestModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var test_controller_1 = require("./test.controller");
var test_service_1 = require("./test.service");
var articulo_entity_1 = require("../normativa/articulo.entity");
var oposicion_ley_entity_1 = require("../ley/oposicion-ley.entity");
var pregunta_banco_entity_1 = require("../tema/pregunta-banco.entity");
var tema_entity_1 = require("../tema/tema.entity");
var resultado_test_entity_1 = require("./resultado-test.entity");
var pregunta_test_entity_1 = require("./pregunta-test.entity");
var usuario_entity_1 = require("../usuario/usuario.entity");
var tema_module_1 = require("../tema/tema.module");
var tema_normativa_entity_1 = require("../tema/tema-normativa.entity");
var configuracion_module_1 = require("../config/configuracion.module");
var TestModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                configuracion_module_1.ConfiguracionModule,
                typeorm_1.TypeOrmModule.forFeature([
                    articulo_entity_1.Articulo,
                    oposicion_ley_entity_1.OposicionLey,
                    pregunta_banco_entity_1.PreguntaBanco,
                    tema_entity_1.Tema,
                    resultado_test_entity_1.ResultadoTest,
                    usuario_entity_1.Usuario,
                    pregunta_test_entity_1.PreguntaTest,
                    tema_normativa_entity_1.TemaNormativa,
                    tema_entity_1.Tema,
                    articulo_entity_1.Articulo
                ]),
                tema_module_1.TemaModule,
            ],
            controllers: [test_controller_1.TestController],
            providers: [test_service_1.TestService],
            exports: [test_service_1.TestService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TestModule = _classThis = /** @class */ (function () {
        function TestModule_1() {
        }
        return TestModule_1;
    }());
    __setFunctionName(_classThis, "TestModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TestModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TestModule = _classThis;
}();
exports.TestModule = TestModule;
