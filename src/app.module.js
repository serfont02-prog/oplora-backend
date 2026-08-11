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
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var schedule_1 = require("@nestjs/schedule");
var oposicion_module_1 = require("./oposicion/oposicion.module");
var convocatoria_module_1 = require("./convocatoria/convocatoria.module");
var ley_module_1 = require("./ley/ley.module");
var ia_module_1 = require("./ia/ia.module");
var usuario_module_1 = require("./usuario/usuario.module");
var auth_module_1 = require("./auth/auth.module");
var test_module_1 = require("./test/test.module");
var tema_module_1 = require("./tema/tema.module");
var normativa_module_1 = require("./normativa/normativa.module");
var notificacion_module_1 = require("./notificacion/notificacion.module");
var reto_module_1 = require("./reto/reto.module");
var flashcard_module_1 = require("./flashcard/flashcard.module");
var boe_module_1 = require("./boe/boe.module");
var configuracion_module_1 = require("./config/configuracion.module");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                boe_module_1.BoeModule,
                configuracion_module_1.ConfiguracionModule,
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env',
                }),
                schedule_1.ScheduleModule.forRoot(),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: function (config) {
                        return {
                            type: 'postgres',
                            host: config.get('DB_HOST'),
                            port: config.get('DB_PORT'),
                            username: config.get('DB_USERNAME'),
                            password: config.get('DB_PASSWORD'),
                            database: config.get('DB_NAME'),
                            entities: [__dirname + '/**/*.entity{.ts,.js}'],
                            synchronize: true, // solo en desarrollo
                        };
                    },
                }),
                oposicion_module_1.OposicionModule,
                convocatoria_module_1.ConvocatoriaModule,
                ley_module_1.LeyModule,
                ia_module_1.IaModule,
                usuario_module_1.UsuarioModule,
                auth_module_1.AuthModule,
                test_module_1.TestModule,
                tema_module_1.TemaModule,
                normativa_module_1.NormativaModule,
                notificacion_module_1.NotificacionModule,
                reto_module_1.RetoModule,
                flashcard_module_1.FlashcardModule,
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
