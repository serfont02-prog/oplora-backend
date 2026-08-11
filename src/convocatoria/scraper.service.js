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
exports.ScraperService = void 0;
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule");
var axios_1 = require("axios");
var cheerio = require("cheerio");
var documento_convocatoria_entity_1 = require("./documento-convocatoria.entity");
var ScraperService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _checkTodasConvocatorias_decorators;
    var ScraperService = _classThis = /** @class */ (function () {
        function ScraperService_1(convocatoriaService) {
            this.convocatoriaService = (__runInitializers(this, _instanceExtraInitializers), convocatoriaService);
            this.logger = new common_1.Logger(ScraperService.name);
        }
        ScraperService_1.prototype.checkTodasConvocatorias = function () {
            return __awaiter(this, void 0, void 0, function () {
                var convocatorias, _i, convocatorias_1, c;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('Iniciando check de convocatorias...');
                            return [4 /*yield*/, this.convocatoriaService.findActivasConUrl()];
                        case 1:
                            convocatorias = _a.sent();
                            _i = 0, convocatorias_1 = convocatorias;
                            _a.label = 2;
                        case 2:
                            if (!(_i < convocatorias_1.length)) return [3 /*break*/, 5];
                            c = convocatorias_1[_i];
                            return [4 /*yield*/, this.scrapeConvocatoria(c.id, c.urlInap)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            this.logger.log("Check finalizado. ".concat(convocatorias.length, " convocatorias revisadas."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        ScraperService_1.prototype.scrapeConvocatoria = function (convocatoriaId, url) {
            return __awaiter(this, void 0, void 0, function () {
                var html, plazo, $_1, pdfsEncontrados_2, _i, pdfsEncontrados_1, pdf, existente, tipo, subtipo, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 9, , 10]);
                            this.logger.log("Scrapeando: ".concat(url));
                            return [4 /*yield*/, axios_1.default.get(url, {
                                    headers: { 'User-Agent': 'Mozilla/5.0' },
                                    timeout: 20000,
                                })];
                        case 1:
                            html = (_a.sent()).data;
                            plazo = this.extraerPlazoInscripcion(html);
                            if (!plazo) return [3 /*break*/, 3];
                            this.logger.log("Plazo inscripci\u00F3n detectado: ".concat(plazo.inicio.toLocaleDateString(), " - ").concat(plazo.fin.toLocaleDateString()));
                            return [4 /*yield*/, this.convocatoriaService.actualizarPlazo(convocatoriaId, plazo.inicio, plazo.fin)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            $_1 = cheerio.load(html);
                            pdfsEncontrados_2 = [];
                            $_1('a[href$=".pdf"]').each(function (_, el) {
                                var href = $_1(el).attr('href');
                                var texto = $_1(el).text().trim();
                                if (href) {
                                    var urlCompleta = href.startsWith('http') ? href : "https://sede.inap.gob.es".concat(href);
                                    pdfsEncontrados_2.push({ texto: texto, url: urlCompleta });
                                }
                            });
                            this.logger.log("Encontrados ".concat(pdfsEncontrados_2.length, " PDFs en ").concat(url));
                            _i = 0, pdfsEncontrados_1 = pdfsEncontrados_2;
                            _a.label = 4;
                        case 4:
                            if (!(_i < pdfsEncontrados_1.length)) return [3 /*break*/, 8];
                            pdf = pdfsEncontrados_1[_i];
                            return [4 /*yield*/, this.convocatoriaService.findDocumentosByUrl(pdf.url)];
                        case 5:
                            existente = _a.sent();
                            if (existente.length > 0)
                                return [3 /*break*/, 7];
                            tipo = this.clasificarDocumento(pdf.texto);
                            subtipo = this.detectarSubtipo(pdf.texto);
                            return [4 /*yield*/, this.convocatoriaService.saveDocumento({
                                    titulo: pdf.texto || 'Documento sin título',
                                    tipo: tipo,
                                    subtipo: subtipo,
                                    urlPdf: pdf.url,
                                    procesado: false,
                                    convocatoria: { id: convocatoriaId },
                                })];
                        case 6:
                            _a.sent();
                            this.logger.log("Nuevo documento detectado: ".concat(pdf.texto, " (").concat(tipo).concat(subtipo ? ' · ' + subtipo : '', ")"));
                            _a.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 4];
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            error_1 = _a.sent();
                            this.logger.error("Error scrapeando ".concat(url, ": ").concat(error_1.message));
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        ScraperService_1.prototype.clasificarDocumento = function (texto) {
            var t = texto.toLowerCase();
            if (t.includes('admitidos') && t.includes('provisional'))
                return documento_convocatoria_entity_1.TipoDocumento.LISTA_ADMITIDOS_PROVISIONAL;
            if (t.includes('admitidos') && t.includes('definitiv'))
                return documento_convocatoria_entity_1.TipoDocumento.LISTA_ADMITIDOS_DEFINITIVA;
            if (t.includes('excluidos') && t.includes('provisional'))
                return documento_convocatoria_entity_1.TipoDocumento.LISTA_EXCLUIDOS_PROVISIONAL;
            if (t.includes('excluidos') && t.includes('definitiv'))
                return documento_convocatoria_entity_1.TipoDocumento.LISTA_EXCLUIDOS_DEFINITIVA;
            if (t.includes('acceso general') || t.includes('cupo norma'))
                return documento_convocatoria_entity_1.TipoDocumento.LISTA_ADMITIDOS_PROVISIONAL;
            if (t.includes('nota informativa'))
                return documento_convocatoria_entity_1.TipoDocumento.NOTA_INFORMATIVA;
            if (t.includes('normas específicas') || t.includes('normas especificas'))
                return documento_convocatoria_entity_1.TipoDocumento.NORMAS_ESPECIFICAS;
            if (t.includes('guía') || t.includes('guia'))
                return documento_convocatoria_entity_1.TipoDocumento.GUIA_INSCRIPCION;
            if (t.includes('cronograma'))
                return documento_convocatoria_entity_1.TipoDocumento.CRONOGRAMA;
            if (t.includes('resultado') || t.includes('calificacion'))
                return documento_convocatoria_entity_1.TipoDocumento.RESULTADO_EJERCICIO;
            if (t.includes('resolución') || t.includes('resolucion'))
                return documento_convocatoria_entity_1.TipoDocumento.RESOLUCION_CONVOCATORIA;
            return documento_convocatoria_entity_1.TipoDocumento.OTRO;
        };
        ScraperService_1.prototype.detectarSubtipo = function (texto) {
            var t = texto.toLowerCase();
            if (t.includes('acceso general'))
                return 'acceso_general';
            if (t.includes('cupo norma') || t.includes('discapacidad'))
                return 'cupo_discapacidad';
            return null;
        };
        ScraperService_1.prototype.extraerPlazoInscripcion = function (html) {
            var $ = cheerio.load(html);
            var texto = $('body').text();
            var patron = /Del\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\s+al\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i;
            var match = texto.match(patron);
            if (!match)
                return null;
            var meses = {
                enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
                julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
            };
            var parseFecha = function (str) {
                var partes = str.toLowerCase().match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
                if (!partes)
                    return null;
                return new Date(parseInt(partes[3]), meses[partes[2]], parseInt(partes[1]));
            };
            var inicio = parseFecha(match[1]);
            var fin = parseFecha(match[2]);
            if (!inicio || !fin)
                return null;
            return { inicio: inicio, fin: fin };
        };
        return ScraperService_1;
    }());
    __setFunctionName(_classThis, "ScraperService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _checkTodasConvocatorias_decorators = [(0, schedule_1.Cron)('0 */4 * * *')];
        __esDecorate(_classThis, null, _checkTodasConvocatorias_decorators, { kind: "method", name: "checkTodasConvocatorias", static: false, private: false, access: { has: function (obj) { return "checkTodasConvocatorias" in obj; }, get: function (obj) { return obj.checkTodasConvocatorias; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ScraperService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ScraperService = _classThis;
}();
exports.ScraperService = ScraperService;
