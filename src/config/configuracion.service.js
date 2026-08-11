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
exports.ConfiguracionService = void 0;
var common_1 = require("@nestjs/common");
var DEFAULTS = {
    limites_planes: {
        gratuito: {
            preguntasPorTest: 5,
            preguntasPorTema: 5,
            preguntasTestDia: 20,
            flashcardsDia: 20,
            simulacros: false,
            oposiciones: 1,
            apuntes: false,
        },
        esencial: {
            preguntasPorTest: 50,
            preguntasPorTema: 25,
            preguntasTestDia: 200,
            flashcardsDia: 200,
            simulacros: true,
            oposiciones: 1,
            apuntes: true,
        },
        profesional: {
            preguntasPorTest: 200,
            preguntasPorTema: 100,
            preguntasTestDia: null,
            flashcardsDia: null,
            simulacros: true,
            oposiciones: null,
            apuntes: true,
        },
    },
    niveles_estudio: [
        { nivel: 1, nombre: 'Opositor', puntosMin: 0, puntosMax: 100, badge: '🌱' },
        { nivel: 2, nombre: 'Estudiante', puntosMin: 101, puntosMax: 300, badge: '📚' },
        { nivel: 3, nombre: 'Preparado', puntosMin: 301, puntosMax: 700, badge: '⚡' },
        { nivel: 4, nombre: 'Experto', puntosMin: 701, puntosMax: 1500, badge: '🎯' },
        { nivel: 5, nombre: 'Élite', puntosMin: 1501, puntosMax: null, badge: '🏆' },
    ],
    puntos_acciones: {
        preguntaCorrecta: 2,
        testCompletadoMas80: 10,
        testCompletadoMas60: 5,
        flashcardDominada: 5,
        rachaDiaria: 5,
        ganarReto: 20,
    },
};
var ConfiguracionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ConfiguracionService = _classThis = /** @class */ (function () {
        function ConfiguracionService_1(repo) {
            this.repo = repo;
        }
        ConfiguracionService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.seed()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ConfiguracionService_1.prototype.seed = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, _b, clave, valor, existe;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _i = 0, _a = Object.entries(DEFAULTS);
                            _c.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            _b = _a[_i], clave = _b[0], valor = _b[1];
                            return [4 /*yield*/, this.repo.findOne({ where: { clave: clave } })];
                        case 2:
                            existe = _c.sent();
                            if (!!existe) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.repo.save(this.repo.create({ clave: clave, valor: valor }))];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        ConfiguracionService_1.prototype.get = function (clave) {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.repo.findOne({ where: { clave: clave } })];
                        case 1:
                            config = _c.sent();
                            return [2 /*return*/, (_b = (_a = config === null || config === void 0 ? void 0 : config.valor) !== null && _a !== void 0 ? _a : DEFAULTS[clave]) !== null && _b !== void 0 ? _b : null];
                    }
                });
            });
        };
        ConfiguracionService_1.prototype.getAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                var configs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.find()];
                        case 1:
                            configs = _a.sent();
                            return [2 /*return*/, Object.fromEntries(configs.map(function (c) { return [c.clave, c.valor]; }))];
                    }
                });
            });
        };
        ConfiguracionService_1.prototype.set = function (clave, valor) {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.findOne({ where: { clave: clave } })];
                        case 1:
                            config = _a.sent();
                            if (config) {
                                config.valor = valor;
                                return [2 /*return*/, this.repo.save(config)];
                            }
                            return [2 /*return*/, this.repo.save(this.repo.create({ clave: clave, valor: valor }))];
                    }
                });
            });
        };
        ConfiguracionService_1.prototype.getLimitesPlanes = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.get('limites_planes')];
                });
            });
        };
        ConfiguracionService_1.prototype.getNivelesEstudio = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.get('niveles_estudio')];
                });
            });
        };
        ConfiguracionService_1.prototype.getPuntosAcciones = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.get('puntos_acciones')];
                });
            });
        };
        ConfiguracionService_1.prototype.calcularNivelPorPuntos = function (puntos) {
            return __awaiter(this, void 0, void 0, function () {
                var niveles, nivel;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getNivelesEstudio()];
                        case 1:
                            niveles = _b.sent();
                            nivel = niveles
                                .slice()
                                .reverse()
                                .find(function (n) { return puntos >= n.puntosMin; });
                            return [2 /*return*/, (_a = nivel === null || nivel === void 0 ? void 0 : nivel.nivel) !== null && _a !== void 0 ? _a : 1];
                    }
                });
            });
        };
        return ConfiguracionService_1;
    }());
    __setFunctionName(_classThis, "ConfiguracionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConfiguracionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConfiguracionService = _classThis;
}();
exports.ConfiguracionService = ConfiguracionService;
