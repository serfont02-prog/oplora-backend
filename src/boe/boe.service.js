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
exports.BoeService = void 0;
var common_1 = require("@nestjs/common");
var boe_entity_1 = require("./boe.entity");
var axios_1 = require("axios");
var BoeService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BoeService = _classThis = /** @class */ (function () {
        function BoeService_1(boeRepo, oposicionRepo, convocatoriaRepo, claudeService, temaRepo) {
            this.boeRepo = boeRepo;
            this.oposicionRepo = oposicionRepo;
            this.convocatoriaRepo = convocatoriaRepo;
            this.claudeService = claudeService;
            this.temaRepo = temaRepo;
        }
        BoeService_1.prototype.consultarFecha = function (fecha) {
            return __awaiter(this, void 0, void 0, function () {
                var url, res, diario, dias, convocatorias, _i, dias_1, dia, secciones, seccionII, departamentos, _a, departamentos_1, dep, nombreDep, epigrafes, _b, epigrafes_1, epigrafe, nombreEpigrafe, items, _c, items_1, item, tituloItem, e_1;
                var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
                return __generator(this, function (_v) {
                    switch (_v.label) {
                        case 0:
                            _v.trys.push([0, 2, , 3]);
                            url = "https://www.boe.es/datosabiertos/api/boe/sumario/".concat(fecha);
                            return [4 /*yield*/, axios_1.default.get(url, {
                                    headers: { Accept: 'application/json' },
                                })];
                        case 1:
                            res = _v.sent();
                            diario = (_f = (_e = (_d = res.data) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.sumario) === null || _f === void 0 ? void 0 : _f.diario;
                            if (!diario)
                                return [2 /*return*/, []];
                            dias = Array.isArray(diario) ? diario : [diario];
                            convocatorias = [];
                            for (_i = 0, dias_1 = dias; _i < dias_1.length; _i++) {
                                dia = dias_1[_i];
                                secciones = Array.isArray(dia.seccion) ? dia.seccion : [dia.seccion];
                                seccionII = secciones.find(function (s) { return (s === null || s === void 0 ? void 0 : s.codigo) === '2B'; });
                                if (!seccionII)
                                    continue;
                                departamentos = Array.isArray(seccionII.departamento)
                                    ? seccionII.departamento
                                    : [seccionII.departamento];
                                for (_a = 0, departamentos_1 = departamentos; _a < departamentos_1.length; _a++) {
                                    dep = departamentos_1[_a];
                                    if (!dep)
                                        continue;
                                    nombreDep = (_h = (_g = dep.nombre) === null || _g === void 0 ? void 0 : _g.toLowerCase()) !== null && _h !== void 0 ? _h : '';
                                    if (nombreDep.includes('administración local') || nombreDep.includes('administracion local'))
                                        continue;
                                    epigrafes = Array.isArray(dep.epigrafe) ? dep.epigrafe : [dep.epigrafe];
                                    for (_b = 0, epigrafes_1 = epigrafes; _b < epigrafes_1.length; _b++) {
                                        epigrafe = epigrafes_1[_b];
                                        if (!epigrafe)
                                            continue;
                                        nombreEpigrafe = (_k = (_j = epigrafe.nombre) === null || _j === void 0 ? void 0 : _j.toLowerCase()) !== null && _k !== void 0 ? _k : '';
                                        if (nombreEpigrafe.includes('concurso') || nombreEpigrafe.includes('libre designación') || nombreEpigrafe.includes('libre designacion'))
                                            continue;
                                        items = Array.isArray(epigrafe.item) ? epigrafe.item : [epigrafe.item];
                                        for (_c = 0, items_1 = items; _c < items_1.length; _c++) {
                                            item = items_1[_c];
                                            if (!item)
                                                continue;
                                            tituloItem = (_m = (_l = item.titulo) === null || _l === void 0 ? void 0 : _l.toLowerCase()) !== null && _m !== void 0 ? _m : '';
                                            if (tituloItem.includes('relación') || tituloItem.includes('relacion') || tituloItem.includes('concurso') || tituloItem.includes('universidad'))
                                                continue;
                                            convocatorias.push({
                                                referenciaBOE: (_o = item.identificador) !== null && _o !== void 0 ? _o : '',
                                                titulo: (_p = item.titulo) !== null && _p !== void 0 ? _p : '',
                                                urlPdf: (_r = (_q = item.url_pdf) === null || _q === void 0 ? void 0 : _q.texto) !== null && _r !== void 0 ? _r : '',
                                                urlHtml: (_s = item.url_html) !== null && _s !== void 0 ? _s : '',
                                                departamento: (_t = dep.nombre) !== null && _t !== void 0 ? _t : '',
                                                epigrafe: (_u = epigrafe.nombre) !== null && _u !== void 0 ? _u : '',
                                                fechaBOE: fecha,
                                            });
                                        }
                                    }
                                }
                            }
                            return [2 /*return*/, convocatorias];
                        case 2:
                            e_1 = _v.sent();
                            throw new common_1.HttpException("Error consultando BOE: ".concat(e_1.message), 500);
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        BoeService_1.prototype.guardarConvocatoria = function (datos) {
            return __awaiter(this, void 0, void 0, function () {
                var existente;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.boeRepo.findOne({
                                where: { referenciaBOE: datos.referenciaBOE },
                            })];
                        case 1:
                            existente = _a.sent();
                            if (existente)
                                return [2 /*return*/, existente];
                            return [2 /*return*/, this.boeRepo.save(this.boeRepo.create(__assign(__assign({}, datos), { estado: boe_entity_1.EstadoBOE.PENDIENTE })))];
                    }
                });
            });
        };
        BoeService_1.prototype.getPendientes = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.boeRepo.find({
                            where: { estado: boe_entity_1.EstadoBOE.PENDIENTE },
                            order: { creadoEn: 'DESC' },
                        })];
                });
            });
        };
        BoeService_1.prototype.aprobar = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.boeRepo.update(id, { estado: boe_entity_1.EstadoBOE.APROBADA })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.boeRepo.findOne({ where: { id: id } })];
                    }
                });
            });
        };
        BoeService_1.prototype.rechazar = function (id, notas) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.boeRepo.update(id, { estado: boe_entity_1.EstadoBOE.RECHAZADA, notas: notas })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.boeRepo.findOne({ where: { id: id } })];
                    }
                });
            });
        };
        BoeService_1.prototype.guardarDatosExtraidos = function (id, datos) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.boeRepo.update(id, { datosExtraidos: datos })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.boeRepo.findOne({ where: { id: id } })];
                    }
                });
            });
        };
        BoeService_1.prototype.getAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.boeRepo.find({ order: { creadoEn: 'DESC' } })];
                });
            });
        };
        //EXTRAERDATOSPDFBOE
        BoeService_1.prototype.extraerDatosPDF = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var convocatoria, pdfRes, pdfBuffer, pdfParse, pdfData, texto, prompt_1, cuerpos, datosPrincipales, e_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log('Extrayendo datos PDF para:', id);
                            return [4 /*yield*/, this.boeRepo.findOne({ where: { id: id } })];
                        case 1:
                            convocatoria = _b.sent();
                            if (!convocatoria)
                                throw new common_1.HttpException('Convocatoria no encontrada', 404);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 7, , 8]);
                            return [4 /*yield*/, axios_1.default.get(convocatoria.urlPdf, { responseType: 'arraybuffer' })];
                        case 3:
                            pdfRes = _b.sent();
                            console.log('PDF descargado, tamaño:', pdfRes.data.byteLength);
                            pdfBuffer = Buffer.from(pdfRes.data);
                            pdfParse = require('pdf-parse');
                            return [4 /*yield*/, pdfParse(pdfBuffer)];
                        case 4:
                            pdfData = _b.sent();
                            console.log('PDF parseado, texto:', pdfData.text.slice(0, 100));
                            texto = pdfData.text.slice(0, 5000);
                            prompt_1 = "Del siguiente texto de una resoluci\u00F3n del BOE espa\u00F1ol extrae los datos de TODOS los cuerpos convocados.\n  \nDevuelve SOLO un JSON array con este formato:\n[\n  {\n    \"nombreOposicion\": \"nombre completo del cuerpo\",\n    \"subgrupo\": \"A1|A2|C1|C2|E\",\n    \"turno\": \"libre|promocion_interna\",\n    \"plazas\": n\u00FAmero o null,\n    \"administracion\": \"AGE|CCAA|Local\",\n    \"ministerio\": \"nombre del ministerio\"\n  }\n]\n\nSi solo hay un cuerpo devuelve un array con un solo elemento.\nNo incluyas texto adicional, solo el JSON.\n\nTEXTO:\n".concat(texto);
                            return [4 /*yield*/, this.claudeService.chatJson(prompt_1)];
                        case 5:
                            cuerpos = _b.sent();
                            console.log('Cuerpos detectados:', cuerpos);
                            datosPrincipales = (_a = cuerpos[0]) !== null && _a !== void 0 ? _a : {};
                            return [4 /*yield*/, this.boeRepo.update(id, {
                                    datosExtraidos: __assign(__assign({}, datosPrincipales), { cuerpos: cuerpos })
                                })];
                        case 6:
                            _b.sent();
                            return [2 /*return*/, { cuerpos: cuerpos, datos: datosPrincipales }];
                        case 7:
                            e_2 = _b.sent();
                            console.error('Error en extraerDatosPDF:', e_2.message);
                            throw new common_1.HttpException("Error: ".concat(e_2.message), 500);
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        //TAREAS PENDIENTES PARA EL ADMIN
        BoeService_1.prototype.getTareasPendientes = function () {
            return __awaiter(this, void 0, void 0, function () {
                var boesPendientes, convocatoriasSinInap, oposicionesSinTemas;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.boeRepo.count({
                                where: { estado: boe_entity_1.EstadoBOE.PENDIENTE },
                            })];
                        case 1:
                            boesPendientes = _a.sent();
                            return [4 /*yield*/, this.convocatoriaRepo
                                    .createQueryBuilder('c')
                                    .leftJoinAndSelect('c.oposicion', 'o')
                                    .where('(c.urlInap IS NULL OR c.urlInap = :empty)', { empty: '' })
                                    .andWhere('c.estado = :estado', { estado: 'activa' })
                                    .getMany()];
                        case 2:
                            convocatoriasSinInap = _a.sent();
                            return [4 /*yield*/, this.oposicionRepo
                                    .createQueryBuilder('o')
                                    .leftJoin('o.convocatorias', 'c')
                                    .leftJoin('c.temas', 't')
                                    .where('o.activa = true')
                                    .andWhere('t.id IS NULL')
                                    .select(['o.id', 'o.nombre'])
                                    .getMany()];
                        case 3:
                            oposicionesSinTemas = _a.sent();
                            return [2 /*return*/, {
                                    boesPendientes: boesPendientes,
                                    convocatoriasSinInap: convocatoriasSinInap.map(function (c) {
                                        var _a, _b;
                                        return ({
                                            id: c.id,
                                            anyo: c.anyo,
                                            oposicionId: (_a = c.oposicion) === null || _a === void 0 ? void 0 : _a.id,
                                            oposicionNombre: (_b = c.oposicion) === null || _b === void 0 ? void 0 : _b.nombre,
                                        });
                                    }),
                                    oposicionesSinTemas: oposicionesSinTemas.map(function (o) { return ({
                                        id: o.id,
                                        nombre: o.nombre,
                                    }); }),
                                    total: boesPendientes + convocatoriasSinInap.length + oposicionesSinTemas.length,
                                }];
                    }
                });
            });
        };
        BoeService_1.prototype.extraerTemarioYCaracteristicas = function (urlPdf) {
            return __awaiter(this, void 0, void 0, function () {
                var pdfRes, pdfBuffer, pdfParse, pdfData, texto, prompt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, axios_1.default.get(urlPdf, { responseType: 'arraybuffer' })];
                        case 1:
                            pdfRes = _a.sent();
                            pdfBuffer = Buffer.from(pdfRes.data);
                            pdfParse = require('pdf-parse');
                            return [4 /*yield*/, pdfParse(pdfBuffer)];
                        case 2:
                            pdfData = _a.sent();
                            texto = pdfData.text.slice(0, 12000);
                            prompt = "Del siguiente texto de una resoluci\u00F3n de convocatoria de oposiciones del BOE espa\u00F1ol extrae:\n\n1. El programa/temario completo si existe\n2. Las caracter\u00EDsticas del proceso selectivo\n\nDevuelve SOLO este JSON:\n{\n  \"temas\": [\n    { \"numero\": 1, \"titulo\": \"T\u00EDtulo exacto del tema 1\" },\n    { \"numero\": 2, \"titulo\": \"T\u00EDtulo exacto del tema 2\" }\n  ],\n  \"caracteristicas\": {\n    \"numEjercicios\": 1,\n    \"tipoEjercicio\": \"test|desarrollo|oral|practico|mixto\",\n    \"numPreguntas\": 100,\n    \"tiempoMinutos\": 90,\n    \"penalizacion\": true,\n    \"fraccionPenalizacion\": \"1/3\",\n    \"notaMinimaAprobado\": 5.0\n  }\n}\n\nSi no encuentras temario devuelve \"temas\": [].\nSi no encuentras alguna caracter\u00EDstica devuelve null para ese campo.\nNo incluyas texto adicional, solo el JSON.\n\nTEXTO:\n".concat(texto);
                            return [4 /*yield*/, this.claudeService.chatJson(prompt)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        BoeService_1.prototype.compararTemarios = function (temasNuevos, temasAnteriores) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt, resultado;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (temasAnteriores.length === 0) {
                                return [2 /*return*/, {
                                        porcentajeCoincidencia: 0,
                                        temasNuevos: temasNuevos.map(function (t) { return t.titulo; }),
                                        temasEliminados: [],
                                        temasModificados: [],
                                        sonIguales: false,
                                    }];
                            }
                            prompt = "Compara estos dos temarios de oposiciones espa\u00F1olas y devuelve SOLO un JSON con este formato:\n{\n  \"porcentajeCoincidencia\": 95,\n  \"temasNuevos\": [\"t\u00EDtulo de tema que aparece en nuevo pero no en anterior\"],\n  \"temasEliminados\": [\"t\u00EDtulo de tema que aparece en anterior pero no en nuevo\"],\n  \"temasModificados\": [{ \"anterior\": \"t\u00EDtulo anterior\", \"nuevo\": \"t\u00EDtulo nuevo\" }]\n}\n\nConsidera que dos temas son el mismo aunque tengan peque\u00F1as diferencias de redacci\u00F3n.\nSolo marca como modificado si el contenido ha cambiado significativamente.\n\nTEMARIO ANTERIOR:\n".concat(temasAnteriores.map(function (t) { return "".concat(t.numero, ". ").concat(t.titulo); }).join('\n'), "\n\nTEMARIO NUEVO:\n").concat(temasNuevos.map(function (t) { return "".concat(t.numero, ". ").concat(t.titulo); }).join('\n'));
                            return [4 /*yield*/, this.claudeService.chatJson(prompt)];
                        case 1:
                            resultado = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, resultado), { sonIguales: resultado.porcentajeCoincidencia >= 95 && resultado.temasNuevos.length === 0 && resultado.temasEliminados.length === 0 })];
                    }
                });
            });
        };
        //PROCESAR CONVOCATORIA EXTRAIDA DEL BOE
        BoeService_1.prototype.procesarConvocatoria = function (id, oposicionExistenteId) {
            return __awaiter(this, void 0, void 0, function () {
                var boe, datos, oposicion, convocatoria;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.boeRepo.findOne({ where: { id: id } })];
                        case 1:
                            boe = _b.sent();
                            if (!boe)
                                throw new common_1.HttpException('No encontrada', 404);
                            datos = (_a = boe.datosExtraidos) !== null && _a !== void 0 ? _a : {};
                            oposicion = null;
                            if (!oposicionExistenteId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.oposicionRepo.findOne({ where: { id: oposicionExistenteId } })];
                        case 2:
                            oposicion = _b.sent();
                            _b.label = 3;
                        case 3:
                            convocatoria = null;
                            if (!oposicion) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.convocatoriaRepo.save(this.convocatoriaRepo.create({
                                    anyo: datos.anyo ? parseInt(datos.anyo.toString()) : new Date().getFullYear(),
                                    plazas: datos.plazas,
                                    estado: 'borrador',
                                    referenciaBoe: boe.referenciaBOE,
                                    oposicion: { id: oposicion.id },
                                }))];
                        case 4:
                            convocatoria = _b.sent();
                            return [4 /*yield*/, this.oposicionRepo.update(oposicion.id, { activa: true })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [4 /*yield*/, this.boeRepo.update(id, { estado: boe_entity_1.EstadoBOE.PROCESADA })];
                        case 7:
                            _b.sent();
                            return [2 /*return*/, {
                                    accion: oposicion ? 'convocatoria_creada' : 'solo_aprobada',
                                    oposicionId: oposicion === null || oposicion === void 0 ? void 0 : oposicion.id,
                                    convocatoriaId: convocatoria === null || convocatoria === void 0 ? void 0 : convocatoria.id,
                                }];
                    }
                });
            });
        };
        return BoeService_1;
    }());
    __setFunctionName(_classThis, "BoeService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BoeService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BoeService = _classThis;
}();
exports.BoeService = BoeService;
