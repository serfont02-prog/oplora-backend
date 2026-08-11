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
exports.ParseoService = void 0;
var common_1 = require("@nestjs/common");
var ParseoService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ParseoService = _classThis = /** @class */ (function () {
        function ParseoService_1(versionRepo, tituloRepo, capituloRepo, articuloRepo, seccionRepo, libroRepo, iaService) {
            this.versionRepo = versionRepo;
            this.tituloRepo = tituloRepo;
            this.capituloRepo = capituloRepo;
            this.articuloRepo = articuloRepo;
            this.seccionRepo = seccionRepo;
            this.libroRepo = libroRepo;
            this.iaService = iaService;
            this.logger = new common_1.Logger(ParseoService.name);
        }
        ParseoService_1.prototype.parsearVersion = function (versionId) {
            return __awaiter(this, void 0, void 0, function () {
                var version, chunks, estructura, contenido, resumen;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.versionRepo.findOne({
                                where: { id: versionId },
                                relations: ['ley'],
                            })];
                        case 1:
                            version = _a.sent();
                            if (!version)
                                throw new common_1.NotFoundException("Versi\u00F3n ".concat(versionId, " no encontrada"));
                            if (!version.textoCompleto)
                                throw new Error('La versión no tiene texto extraído');
                            this.logger.log("Iniciando parseo de ".concat(version.ley.nombre, " v").concat(version.version));
                            chunks = this.dividirTexto(version.textoCompleto, 3000);
                            this.logger.log("Texto dividido en ".concat(chunks.length, " fragmentos"));
                            return [4 /*yield*/, this.detectarEstructura(chunks[0], version.ley.nombre)];
                        case 2:
                            estructura = _a.sent();
                            this.logger.log("Estructura detectada: ".concat(JSON.stringify(estructura)));
                            return [4 /*yield*/, this.parsearContenido(version.textoCompleto, estructura)];
                        case 3:
                            contenido = _a.sent();
                            return [4 /*yield*/, this.guardarEstructura(versionId, contenido)];
                        case 4:
                            resumen = _a.sent();
                            this.logger.log("Parseo completado: ".concat(JSON.stringify(resumen)));
                            return [2 /*return*/, { ok: true, resumen: resumen }];
                    }
                });
            });
        };
        ParseoService_1.prototype.dividirTexto = function (texto, maxCaracteres) {
            var chunks = [];
            for (var i = 0; i < texto.length; i += maxCaracteres) {
                chunks.push(texto.slice(i, i + maxCaracteres));
            }
            return chunks;
        };
        ParseoService_1.prototype.detectarEstructura = function (muestra, _nombreLey) {
            return __awaiter(this, void 0, void 0, function () {
                var texto;
                return __generator(this, function (_a) {
                    texto = muestra.toLowerCase();
                    return [2 /*return*/, {
                            tieneLibros: texto.includes('libro ') || texto.includes('libro i') || texto.includes('libro ii'),
                            tieneTitulos: texto.includes('título ') || texto.includes('titulo ') || texto.includes('título i'),
                            tieneCapitulos: texto.includes('capítulo ') || texto.includes('capitulo ') || texto.includes('capítulo i'),
                            tieneSecciones: texto.includes('sección ') || texto.includes('seccion '),
                        }];
                });
            });
        };
        ParseoService_1.prototype.parsearContenido = function (texto, _estructura) {
            return __awaiter(this, void 0, void 0, function () {
                var system, prompt, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            system = "Eres un parser de textos legales espa\u00F1oles. \nResponde \u00DANICAMENTE con JSON v\u00E1lido. Sin texto adicional. Sin markdown. Solo JSON.";
                            prompt = "Extrae los art\u00EDculos de este texto legal espa\u00F1ol.\nDevuelve SOLO este JSON, nada m\u00E1s:\n{\n  \"tieneLibros\": false,\n  \"titulos\": [\n    {\n      \"numero\": \"I\",\n      \"nombre\": \"nombre del titulo\",\n      \"capitulos\": [\n        {\n          \"numero\": \"I\",\n          \"nombre\": \"nombre del capitulo\",\n          \"articulos\": [\n            {\n              \"numero\": \"1\",\n              \"titulo\": \"rubrica del articulo o null\",\n              \"contenido\": \"texto completo del articulo\"\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n\nTEXTO:\n".concat(texto.slice(0, 3000));
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.iaService.chatJson(prompt, system)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            e_1 = _a.sent();
                            this.logger.error("Error parseando: ".concat(e_1.message));
                            return [2 /*return*/, { tieneLibros: false, titulos: [] }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        ParseoService_1.prototype.guardarEstructura = function (versionId, estructura) {
            return __awaiter(this, void 0, void 0, function () {
                var totalTitulos, totalCapitulos, totalArticulos, titulos, ti, tData, titulo, tituloGuardado, capitulos, ci, cData, capitulo, capituloGuardado, articulos, ai, aData, articulo, secciones, si, sData, seccion, seccionGuardada, articulosSeccion, ai, aData, articulo, articulosTitulo, ai, aData, articulo;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            totalTitulos = 0;
                            totalCapitulos = 0;
                            totalArticulos = 0;
                            titulos = (_a = estructura.titulos) !== null && _a !== void 0 ? _a : [];
                            ti = 0;
                            _g.label = 1;
                        case 1:
                            if (!(ti < titulos.length)) return [3 /*break*/, 21];
                            tData = titulos[ti];
                            titulo = this.tituloRepo.create({
                                orden: ti + 1,
                                numero: tData.numero,
                                nombre: tData.nombre,
                                versionLey: { id: versionId },
                            });
                            return [4 /*yield*/, this.tituloRepo.save(titulo)];
                        case 2:
                            tituloGuardado = _g.sent();
                            totalTitulos++;
                            capitulos = (_b = tData.capitulos) !== null && _b !== void 0 ? _b : [];
                            ci = 0;
                            _g.label = 3;
                        case 3:
                            if (!(ci < capitulos.length)) return [3 /*break*/, 16];
                            cData = capitulos[ci];
                            capitulo = this.capituloRepo.create({
                                orden: ci + 1,
                                numero: cData.numero,
                                nombre: cData.nombre,
                                tituloRef: { id: tituloGuardado.id },
                            });
                            return [4 /*yield*/, this.capituloRepo.save(capitulo)];
                        case 4:
                            capituloGuardado = _g.sent();
                            totalCapitulos++;
                            articulos = (_c = cData.articulos) !== null && _c !== void 0 ? _c : [];
                            ai = 0;
                            _g.label = 5;
                        case 5:
                            if (!(ai < articulos.length)) return [3 /*break*/, 8];
                            aData = articulos[ai];
                            articulo = this.articuloRepo.create({
                                orden: ai + 1,
                                numero: aData.numero,
                                titulo: aData.titulo,
                                contenido: aData.contenido,
                                vigente: true,
                                pesoExamen: 1,
                                capitulo: { id: capituloGuardado.id },
                            });
                            return [4 /*yield*/, this.articuloRepo.save(articulo)];
                        case 6:
                            _g.sent();
                            totalArticulos++;
                            _g.label = 7;
                        case 7:
                            ai++;
                            return [3 /*break*/, 5];
                        case 8:
                            secciones = (_d = cData.secciones) !== null && _d !== void 0 ? _d : [];
                            si = 0;
                            _g.label = 9;
                        case 9:
                            if (!(si < secciones.length)) return [3 /*break*/, 15];
                            sData = secciones[si];
                            seccion = this.seccionRepo.create({
                                orden: si + 1,
                                numero: sData.numero,
                                nombre: sData.nombre,
                                capitulo: { id: capituloGuardado.id },
                            });
                            return [4 /*yield*/, this.seccionRepo.save(seccion)];
                        case 10:
                            seccionGuardada = _g.sent();
                            articulosSeccion = (_e = sData.articulos) !== null && _e !== void 0 ? _e : [];
                            ai = 0;
                            _g.label = 11;
                        case 11:
                            if (!(ai < articulosSeccion.length)) return [3 /*break*/, 14];
                            aData = articulosSeccion[ai];
                            articulo = this.articuloRepo.create({
                                orden: ai + 1,
                                numero: aData.numero,
                                titulo: aData.titulo,
                                contenido: aData.contenido,
                                vigente: true,
                                pesoExamen: 1,
                                seccion: { id: seccionGuardada.id },
                            });
                            return [4 /*yield*/, this.articuloRepo.save(articulo)];
                        case 12:
                            _g.sent();
                            totalArticulos++;
                            _g.label = 13;
                        case 13:
                            ai++;
                            return [3 /*break*/, 11];
                        case 14:
                            si++;
                            return [3 /*break*/, 9];
                        case 15:
                            ci++;
                            return [3 /*break*/, 3];
                        case 16:
                            articulosTitulo = (_f = tData.articulos) !== null && _f !== void 0 ? _f : [];
                            ai = 0;
                            _g.label = 17;
                        case 17:
                            if (!(ai < articulosTitulo.length)) return [3 /*break*/, 20];
                            aData = articulosTitulo[ai];
                            articulo = this.articuloRepo.create({
                                orden: ai + 1,
                                numero: aData.numero,
                                titulo: aData.titulo,
                                contenido: aData.contenido,
                                vigente: true,
                                pesoExamen: 1,
                            });
                            return [4 /*yield*/, this.articuloRepo.save(articulo)];
                        case 18:
                            _g.sent();
                            totalArticulos++;
                            _g.label = 19;
                        case 19:
                            ai++;
                            return [3 /*break*/, 17];
                        case 20:
                            ti++;
                            return [3 /*break*/, 1];
                        case 21: return [2 /*return*/, { totalTitulos: totalTitulos, totalCapitulos: totalCapitulos, totalArticulos: totalArticulos }];
                    }
                });
            });
        };
        return ParseoService_1;
    }());
    __setFunctionName(_classThis, "ParseoService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParseoService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParseoService = _classThis;
}();
exports.ParseoService = ParseoService;
