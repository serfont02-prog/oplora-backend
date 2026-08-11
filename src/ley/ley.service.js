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
exports.LeyService = void 0;
var common_1 = require("@nestjs/common");
var version_ley_entity_1 = require("./version-ley.entity");
var fs = require("fs");
var pdfParse = require('pdf-parse');
var LeyService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LeyService = _classThis = /** @class */ (function () {
        function LeyService_1(leyRepo, versionRepo, diffRepo, oposicionLeyRepo) {
            this.leyRepo = leyRepo;
            this.versionRepo = versionRepo;
            this.diffRepo = diffRepo;
            this.oposicionLeyRepo = oposicionLeyRepo;
        }
        // ─── LEYES ───────────────────────────────────────────────
        LeyService_1.prototype.findAll = function (search) {
            var qb = this.leyRepo.createQueryBuilder('l')
                .leftJoinAndSelect('l.versiones', 'v', 'v.activa = true')
                .leftJoinAndSelect('l.oposicionLeyes', 'ol')
                .orderBy('l.nombre', 'ASC');
            if (search) {
                qb.where('LOWER(l.nombre) LIKE :s', { s: "%".concat(search.toLowerCase(), "%") });
            }
            return qb.getMany();
        };
        LeyService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var ley;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.leyRepo.findOne({
                                where: { id: id },
                                relations: ['versiones'],
                            })];
                        case 1:
                            ley = _a.sent();
                            if (!ley)
                                throw new common_1.NotFoundException("Ley ".concat(id, " no encontrada"));
                            return [2 /*return*/, ley];
                    }
                });
            });
        };
        LeyService_1.prototype.create = function (nombre, descripcion) {
            return __awaiter(this, void 0, void 0, function () {
                var ley;
                return __generator(this, function (_a) {
                    ley = this.leyRepo.create({ nombre: nombre, descripcion: descripcion });
                    return [2 /*return*/, this.leyRepo.save(ley)];
                });
            });
        };
        LeyService_1.prototype.update = function (id, datos) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.leyRepo.update(id, datos)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, this.findOne(id)];
                    }
                });
            });
        };
        // ─── VERSIONES ───────────────────────────────────────────
        LeyService_1.prototype.findVersiones = function (leyId) {
            return this.versionRepo.find({
                where: { ley: { id: leyId } },
                order: { fechaPublicacion: 'DESC' },
            });
        };
        LeyService_1.prototype.findVersionActiva = function (leyId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.versionRepo.findOne({
                            where: { ley: { id: leyId }, activa: true },
                        })];
                });
            });
        };
        LeyService_1.prototype.crearVersion = function (leyId, datos, texto) {
            return __awaiter(this, void 0, void 0, function () {
                var version;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: 
                        // Desactivar versión anterior si la hay
                        return [4 /*yield*/, this.versionRepo.update({ ley: { id: leyId }, activa: true }, { activa: false })];
                        case 1:
                            // Desactivar versión anterior si la hay
                            _b.sent();
                            version = this.versionRepo.create(__assign(__assign({}, datos), { fechaPublicacion: datos.fechaPublicacion ? new Date(datos.fechaPublicacion) : undefined, fechaVigencia: datos.fechaVigencia ? new Date(datos.fechaVigencia) : undefined, tipoCambio: (_a = datos.tipoCambio) !== null && _a !== void 0 ? _a : version_ley_entity_1.TipoCambio.INICIAL, activa: true, textoCompleto: texto, ley: { id: leyId } }));
                            return [2 /*return*/, this.versionRepo.save(version)];
                    }
                });
            });
        };
        LeyService_1.prototype.activarVersion = function (versionId) {
            return __awaiter(this, void 0, void 0, function () {
                var version, actualizada;
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
                            return [4 /*yield*/, this.versionRepo.update({ ley: { id: version.ley.id }, activa: true }, { activa: false })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.versionRepo.update(versionId, { activa: true })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.versionRepo.findOne({
                                    where: { id: versionId },
                                    relations: ['ley']
                                })];
                        case 4:
                            actualizada = _a.sent();
                            if (!actualizada)
                                throw new common_1.NotFoundException("Versi\u00F3n ".concat(versionId, " no encontrada"));
                            return [2 /*return*/, actualizada];
                    }
                });
            });
        };
        // ─── PROCESADO DE ARCHIVOS ───────────────────────────────
        LeyService_1.prototype.procesarArchivo = function (filePath, ext) {
            return __awaiter(this, void 0, void 0, function () {
                var buffer, data, texto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(ext === '.pdf')) return [3 /*break*/, 2];
                            buffer = fs.readFileSync(filePath);
                            return [4 /*yield*/, pdfParse(buffer)];
                        case 1:
                            data = _a.sent();
                            fs.unlinkSync(filePath);
                            return [2 /*return*/, data.text];
                        case 2:
                            texto = fs.readFileSync(filePath, 'utf-8');
                            fs.unlinkSync(filePath);
                            return [2 /*return*/, texto];
                    }
                });
            });
        };
        // ─── VINCULACIÓN OPOSICIONES ─────────────────────────────
        LeyService_1.prototype.vincular = function (leyId, oposicionId, versionLeyId) {
            return __awaiter(this, void 0, void 0, function () {
                var existente, vinculo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.oposicionLeyRepo.findOne({
                                where: { ley: { id: leyId }, oposicion: { id: oposicionId } },
                            })];
                        case 1:
                            existente = _a.sent();
                            if (!existente) return [3 /*break*/, 4];
                            if (!versionLeyId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.oposicionLeyRepo.update(existente.id, {
                                    versionLey: { id: versionLeyId },
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/, existente];
                        case 4:
                            vinculo = this.oposicionLeyRepo.create({
                                ley: { id: leyId },
                                oposicion: { id: oposicionId },
                                versionLey: versionLeyId ? { id: versionLeyId } : undefined,
                                obligatoria: true,
                            });
                            return [2 /*return*/, this.oposicionLeyRepo.save(vinculo)];
                    }
                });
            });
        };
        LeyService_1.prototype.desvincular = function (leyId, oposicionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.oposicionLeyRepo.delete({
                                ley: { id: leyId },
                                oposicion: { id: oposicionId },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LeyService_1.prototype.findByOposicion = function (oposicionId) {
            return this.oposicionLeyRepo.find({
                where: { oposicion: { id: oposicionId } },
                relations: ['ley', 'versionLey'],
            });
        };
        LeyService_1.prototype.findOposicionesByLey = function (leyId) {
            return this.oposicionLeyRepo.find({
                where: { ley: { id: leyId } },
                relations: ['oposicion', 'versionLey'],
            });
        };
        // ─── DIFFS ───────────────────────────────────────────────
        LeyService_1.prototype.findDiffs = function (leyId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.diffRepo
                            .createQueryBuilder('d')
                            .leftJoinAndSelect('d.versionNueva', 'vn')
                            .leftJoinAndSelect('d.versionAnterior', 'va')
                            .where('vn.ley.id = :leyId', { leyId: leyId })
                            .orderBy('d.creadoEn', 'DESC')
                            .getMany()];
                });
            });
        };
        LeyService_1.prototype.crearDiff = function (versionNuevaId, versionAnteriorId) {
            return __awaiter(this, void 0, void 0, function () {
                var diff;
                return __generator(this, function (_a) {
                    diff = this.diffRepo.create({
                        versionNueva: { id: versionNuevaId },
                        versionAnterior: versionAnteriorId ? { id: versionAnteriorId } : undefined,
                        generadoPorIa: false,
                    });
                    return [2 /*return*/, this.diffRepo.save(diff)];
                });
            });
        };
        LeyService_1.prototype.eliminar = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.leyRepo.delete(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return LeyService_1;
    }());
    __setFunctionName(_classThis, "LeyService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LeyService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LeyService = _classThis;
}();
exports.LeyService = LeyService;
