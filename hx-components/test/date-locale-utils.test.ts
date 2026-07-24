import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vite-plus/test';
import {
	type AMonth,
	type CalendarDay,
	type CalendarYear,
	DateLocaleUtils,
	DateMoveUtils,
	type GregoryDay
} from '../src';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const D = new Date(2025, 6, 6, 15, 30, 45);

describe('DateLocaleUtils.formatYear', () => {
	it('Gregorian', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', true)).toBe('2025');
	});
	it('zh-CN', () => {
		expect(DateLocaleUtils.formatYear(D, 'zh-CN', false)).toBe('2025');
	});
	it('en-US', () => {
		expect(DateLocaleUtils.formatYear(D, 'en-US', false)).toBe('2025');
	});
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', true)).toBe('2025');
	});
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', false)).toBe('7年');
	});
	it('zh-TW', () => {
		expect(DateLocaleUtils.formatYear(D, 'zh-TW', false)).toBe('114年');
	});
	it('islamic', () => {
		expect(DateLocaleUtils.formatYear(D, 'ar-SA', false)).toBe('١٤٤٧');
	});
	it('ko-KR', () => {
		expect(DateLocaleUtils.formatYear(D, 'ko-KR', false)).toBe('2025');
	});
});

describe('DateLocaleUtils.formatEra', () => {
	it('empty when gregorian', () => {
		expect(DateLocaleUtils.formatEra(D, 'ja-JP', true)).toBe('');
	});
	it('empty for non-era locales', () => {
		expect(DateLocaleUtils.formatEra(D, 'zh-CN', false)).toBe('');
		expect(DateLocaleUtils.formatEra(D, 'en-US', false)).toBe('');
	});
	it('ROC', () => {
		expect(DateLocaleUtils.formatEra(D, 'zh-TW', false)).toBe('民國');
	});
	it('ROC pre-1912', () => {
		expect(DateLocaleUtils.formatEra(new Date(1911, 11, 31), 'zh-TW', false)).toBe('民國前');
	});
});

describe('Japanese era boundaries', () => {
	const eras: Array<{ e: string; f: [number, number, number]; t: [number, number, number]; }> = [
		{e: '令和', f: [2019, 5, 1], t: [2026, 12, 31]},
		{e: '平成', f: [1989, 1, 8], t: [2019, 4, 30]},
		{e: '昭和', f: [1926, 12, 25], t: [1989, 1, 7]},
		{e: '大正', f: [1912, 7, 30], t: [1926, 12, 24]},
		{e: '明治', f: [1868, 10, 23], t: [1912, 7, 29]},
		{e: '慶応', f: [1865, 4, 7], t: [1868, 10, 22]},
		{e: '元治', f: [1864, 2, 20], t: [1865, 4, 6]},
		{e: '文久', f: [1861, 2, 19], t: [1864, 2, 19]},
		{e: '万延', f: [1860, 3, 18], t: [1861, 2, 18]},
		{e: '安政', f: [1854, 11, 27], t: [1860, 3, 17]},
		{e: '嘉永', f: [1848, 2, 28], t: [1854, 11, 26]},
		{e: '弘化', f: [1844, 12, 2], t: [1848, 2, 27]},
		{e: '天保', f: [1830, 12, 10], t: [1844, 12, 1]},
		{e: '文政', f: [1818, 4, 22], t: [1830, 12, 9]},
		{e: '文化', f: [1804, 2, 11], t: [1818, 4, 21]},
		{e: '享和', f: [1801, 2, 5], t: [1804, 2, 10]},
		{e: '寛政', f: [1789, 1, 25], t: [1801, 2, 4]},
		{e: '天明', f: [1781, 4, 2], t: [1789, 1, 24]},
		{e: '安永', f: [1772, 11, 16], t: [1781, 4, 1]},
		{e: '明和', f: [1764, 6, 2], t: [1772, 11, 15]},
		{e: '宝暦', f: [1751, 10, 27], t: [1764, 6, 1]},
		{e: '寛延', f: [1748, 7, 12], t: [1751, 10, 26]},
		{e: '延享', f: [1744, 2, 21], t: [1748, 7, 11]},
		{e: '寛保', f: [1741, 2, 27], t: [1744, 2, 20]},
		{e: '元文', f: [1736, 4, 28], t: [1741, 2, 26]},
		{e: '享保', f: [1716, 6, 22], t: [1736, 4, 27]},
		{e: '正徳', f: [1711, 4, 25], t: [1716, 6, 21]},
		{e: '宝永', f: [1704, 3, 13], t: [1711, 4, 24]},
		{e: '元禄', f: [1688, 9, 30], t: [1704, 3, 12]},
		{e: '貞享', f: [1684, 2, 21], t: [1688, 9, 29]},
		{e: '天和', f: [1681, 9, 29], t: [1684, 2, 20]},
		{e: '延宝', f: [1673, 9, 21], t: [1681, 9, 28]},
		{e: '寛文', f: [1661, 4, 25], t: [1673, 9, 20]},
		{e: '万治', f: [1658, 7, 23], t: [1661, 4, 24]},
		{e: '明暦', f: [1655, 4, 13], t: [1658, 7, 22]},
		{e: '承応', f: [1652, 9, 18], t: [1655, 4, 12]},
		{e: '慶安', f: [1648, 2, 15], t: [1652, 9, 17]},
		{e: '正保', f: [1644, 12, 16], t: [1648, 2, 14]},
		{e: '寛永', f: [1624, 3, 1], t: [1644, 12, 15]},
		{e: '元和', f: [1615, 7, 13], t: [1624, 2, 29]},
		{e: '慶長', f: [1596, 10, 27], t: [1615, 7, 12]},
		{e: '文禄', f: [1592, 12, 8], t: [1596, 10, 26]},
		{e: '天正', f: [1573, 8, 7], t: [1592, 12, 7]},
		{e: '元亀', f: [1570, 5, 3], t: [1573, 8, 6]},
		{e: '永禄', f: [1558, 3, 10], t: [1570, 5, 2]},
		{e: '弘治', f: [1555, 11, 2], t: [1558, 3, 9]},
		{e: '天文', f: [1532, 8, 8], t: [1555, 11, 1]},
		{e: '享禄', f: [1528, 8, 30], t: [1532, 8, 7]},
		{e: '大永', f: [1521, 9, 2], t: [1528, 8, 29]},
		{e: '永正', f: [1504, 3, 11], t: [1521, 9, 1]},
		{e: '文亀', f: [1501, 3, 11], t: [1504, 3, 10]},
		{e: '明応', f: [1492, 7, 28], t: [1501, 3, 10]},
		{e: '延徳', f: [1489, 8, 30], t: [1492, 7, 27]},
		{e: '長享', f: [1487, 8, 7], t: [1489, 8, 29]},
		{e: '文明', f: [1469, 5, 7], t: [1487, 8, 6]},
		{e: '応仁', f: [1467, 3, 12], t: [1469, 5, 6]},
		{e: '文正', f: [1466, 3, 9], t: [1467, 3, 11]},
		{e: '寛正', f: [1460, 12, 30], t: [1466, 3, 8]},
		{e: '長禄', f: [1457, 10, 7], t: [1460, 12, 29]},
		{e: '康正', f: [1455, 8, 3], t: [1457, 10, 6]},
		{e: '享徳', f: [1452, 8, 3], t: [1455, 8, 2]},
		{e: '宝徳', f: [1449, 8, 6], t: [1452, 8, 2]},
		{e: '文安', f: [1444, 2, 14], t: [1449, 8, 5]},
		{e: '嘉吉', f: [1441, 2, 26], t: [1444, 2, 13]},
		{e: '永享', f: [1429, 9, 14], t: [1441, 2, 25]},
		{e: '正長', f: [1428, 5, 6], t: [1429, 9, 13]},
		{e: '応永', f: [1394, 7, 13], t: [1428, 5, 5]},
		{e: '明徳', f: [1390, 4, 3], t: [1394, 7, 12]},
		{e: '康応', f: [1389, 2, 17], t: [1390, 4, 2]},
		{e: '嘉慶', f: [1387, 8, 31], t: [1389, 2, 16]},
		{e: '至徳', f: [1387, 8, 30], t: [1387, 8, 30]},
		{e: '元中', f: [1384, 5, 6], t: [1387, 8, 29]},
		{e: '弘和', f: [1381, 2, 18], t: [1384, 5, 5]},
		{e: '康暦', f: [1379, 3, 30], t: [1381, 2, 17]},
		{e: '天授', f: [1375, 6, 4], t: [1379, 3, 29]},
		{e: '文中', f: [1372, 4, 9], t: [1375, 6, 3]},
		{e: '建徳', f: [1370, 8, 1], t: [1372, 4, 8]},
		{e: '正平', f: [1346, 12, 16], t: [1370, 7, 31]},
		{e: '興国', f: [1340, 5, 6], t: [1346, 12, 15]},
		{e: '延元', f: [1336, 3, 8], t: [1340, 5, 5]},
		{e: '建武', f: [1334, 2, 6], t: [1336, 3, 7]},
		{e: '元弘', f: [1331, 8, 17], t: [1334, 2, 5]},
		{e: '元徳', f: [1329, 9, 6], t: [1331, 8, 16]},
		{e: '嘉暦', f: [1326, 5, 4], t: [1329, 9, 5]},
		{e: '正中', f: [1324, 12, 17], t: [1326, 5, 3]},
		{e: '元亨', f: [1321, 3, 3], t: [1324, 12, 16]},
		{e: '元応', f: [1319, 5, 6], t: [1321, 3, 2]},
		{e: '文保', f: [1317, 2, 11], t: [1319, 5, 5]},
		{e: '正和', f: [1312, 3, 28], t: [1317, 2, 10]},
		{e: '応長', f: [1311, 5, 6], t: [1312, 3, 27]},
		{e: '延慶', f: [1308, 10, 17], t: [1311, 5, 5]},
		{e: '徳治', f: [1306, 12, 22], t: [1308, 10, 16]},
		{e: '嘉元', f: [1303, 8, 13], t: [1306, 12, 21]},
		{e: '乾元', f: [1302, 11, 29], t: [1303, 8, 12]},
		{e: '正安', f: [1299, 5, 2], t: [1302, 11, 28]},
		{e: '永仁', f: [1293, 8, 12], t: [1299, 5, 1]},
		{e: '正応', f: [1288, 5, 5], t: [1293, 8, 11]},
		{e: '弘安', f: [1278, 3, 8], t: [1288, 5, 4]},
		{e: '建治', f: [1275, 5, 2], t: [1278, 3, 7]},
		{e: '文永', f: [1264, 3, 6], t: [1275, 5, 1]},
		{e: '弘長', f: [1261, 2, 27], t: [1264, 3, 5]},
		{e: '文応', f: [1260, 4, 20], t: [1261, 2, 26]},
		{e: '正元', f: [1259, 4, 2], t: [1260, 4, 19]},
		{e: '正嘉', f: [1257, 3, 21], t: [1259, 4, 1]},
		{e: '康元', f: [1256, 10, 12], t: [1257, 3, 20]},
		{e: '建長', f: [1249, 3, 25], t: [1256, 10, 11]},
		{e: '宝治', f: [1247, 3, 7], t: [1249, 3, 24]},
		{e: '寛元', f: [1243, 3, 5], t: [1247, 3, 6]},
		{e: '仁治', f: [1240, 7, 23], t: [1243, 3, 4]},
		{e: '延応', f: [1239, 2, 14], t: [1240, 7, 22]},
		{e: '暦仁', f: [1238, 11, 30], t: [1239, 2, 13]},
		{e: '嘉禎', f: [1235, 9, 26], t: [1238, 11, 29]},
		{e: '文暦', f: [1234, 11, 12], t: [1235, 9, 25]},
		{e: '天福', f: [1233, 4, 22], t: [1234, 11, 11]},
		{e: '貞永', f: [1232, 4, 9], t: [1233, 4, 21]},
		{e: '寛喜', f: [1229, 3, 12], t: [1232, 4, 8]},
		{e: '安貞', f: [1227, 12, 17], t: [1229, 3, 11]},
		{e: '嘉禄', f: [1225, 4, 27], t: [1227, 12, 16]},
		{e: '元仁', f: [1224, 11, 27], t: [1225, 4, 26]},
		{e: '貞応', f: [1222, 4, 20], t: [1224, 11, 26]},
		{e: '承久', f: [1219, 4, 19], t: [1222, 4, 19]},
		{e: '建保', f: [1213, 12, 13], t: [1219, 4, 18]},
		{e: '建暦', f: [1211, 3, 16], t: [1213, 12, 12]},
		{e: '承元', f: [1207, 11, 1], t: [1211, 3, 15]},
		{e: '建永', f: [1206, 5, 4], t: [1207, 10, 31]},
		{e: '元久', f: [1204, 2, 27], t: [1206, 5, 3]},
		{e: '建仁', f: [1201, 2, 20], t: [1204, 2, 26]},
		{e: '正治', f: [1199, 5, 4], t: [1201, 2, 19]},
		{e: '建久', f: [1190, 4, 18], t: [1199, 5, 3]},
		{e: '文治', f: [1185, 8, 21], t: [1190, 4, 17]},
		{e: '元暦', f: [1184, 4, 23], t: [1185, 8, 20]},
		{e: '寿永', f: [1182, 6, 3], t: [1184, 4, 22]},
		{e: '養和', f: [1181, 7, 21], t: [1182, 6, 2]},
		{e: '治承', f: [1177, 8, 11], t: [1181, 7, 20]},
		{e: '安元', f: [1175, 8, 4], t: [1177, 8, 10]},
		{e: '承安', f: [1171, 4, 28], t: [1175, 8, 3]},
		{e: '嘉応', f: [1169, 4, 15], t: [1171, 4, 27]},
		{e: '仁安', f: [1166, 9, 3], t: [1169, 4, 14]},
		{e: '永万', f: [1165, 6, 12], t: [1166, 9, 2]},
		{e: '長寛', f: [1163, 4, 5], t: [1165, 6, 11]},
		{e: '応保', f: [1161, 9, 11], t: [1163, 4, 4]},
		{e: '永暦', f: [1160, 1, 17], t: [1161, 9, 10]},
		{e: '平治', f: [1159, 4, 27], t: [1160, 1, 16]},
		{e: '保元', f: [1156, 5, 4], t: [1159, 4, 26]},
		{e: '久寿', f: [1154, 11, 4], t: [1156, 5, 3]},
		{e: '仁平', f: [1151, 2, 2], t: [1154, 11, 3]},
		{e: '久安', f: [1145, 7, 29], t: [1151, 2, 1]},
		{e: '天養', f: [1144, 3, 1], t: [1145, 7, 28]},
		{e: '康治', f: [1142, 5, 5], t: [1144, 2, 29]},
		{e: '永治', f: [1141, 7, 17], t: [1142, 5, 4]},
		{e: '保延', f: [1135, 5, 4], t: [1141, 7, 16]},
		{e: '長承', f: [1132, 8, 18], t: [1135, 5, 3]},
		{e: '天承', f: [1131, 2, 5], t: [1132, 8, 17]},
		{e: '大治', f: [1126, 1, 29], t: [1131, 2, 4]},
		{e: '天治', f: [1124, 4, 10], t: [1126, 1, 28]},
		{e: '保安', f: [1120, 4, 17], t: [1124, 4, 9]},
		{e: '元永', f: [1118, 4, 10], t: [1120, 4, 16]},
		{e: '永久', f: [1113, 7, 20], t: [1118, 4, 9]},
		{e: '天永', f: [1110, 7, 20], t: [1113, 7, 19]},
		{e: '天仁', f: [1108, 8, 10], t: [1110, 7, 19]},
		{e: '嘉承', f: [1106, 4, 16], t: [1108, 8, 9]},
		{e: '長治', f: [1104, 2, 17], t: [1106, 4, 15]},
		{e: '康和', f: [1099, 9, 3], t: [1104, 2, 16]},
		{e: '承徳', f: [1097, 11, 27], t: [1099, 9, 2]},
		{e: '永長', f: [1096, 12, 23], t: [1097, 11, 26]},
		{e: '嘉保', f: [1094, 12, 21], t: [1096, 12, 22]},
		{e: '寛治', f: [1087, 4, 13], t: [1094, 12, 20]},
		{e: '応徳', f: [1084, 2, 13], t: [1087, 4, 12]},
		{e: '永保', f: [1081, 2, 16], t: [1084, 2, 12]},
		{e: '承暦', f: [1077, 11, 23], t: [1081, 2, 15]},
		{e: '承保', f: [1074, 8, 29], t: [1077, 11, 22]},
		{e: '延久', f: [1069, 4, 19], t: [1074, 8, 28]},
		{e: '治暦', f: [1065, 8, 8], t: [1069, 4, 18]},
		{e: '康平', f: [1058, 9, 4], t: [1065, 8, 7]},
		{e: '天喜', f: [1053, 1, 17], t: [1058, 9, 3]},
		{e: '永承', f: [1046, 4, 20], t: [1053, 1, 16]},
		{e: '寛徳', f: [1044, 11, 30], t: [1046, 4, 19]},
		{e: '長久', f: [1040, 11, 16], t: [1044, 11, 29]},
		{e: '長暦', f: [1037, 4, 27], t: [1040, 11, 15]},
		{e: '長元', f: [1028, 7, 31], t: [1037, 4, 26]},
		{e: '万寿', f: [1024, 7, 19], t: [1028, 7, 30]},
		{e: '治安', f: [1021, 2, 8], t: [1024, 7, 18]},
		{e: '寛仁', f: [1017, 4, 29], t: [1021, 2, 7]},
		{e: '長和', f: [1012, 12, 31], t: [1017, 4, 28]},
		{e: '寛弘', f: [1004, 7, 26], t: [1012, 12, 30]},
		{e: '長保', f: [999, 1, 18], t: [1004, 7, 25]},
		{e: '長徳', f: [995, 2, 27], t: [999, 1, 17]},
		{e: '正暦', f: [990, 11, 12], t: [995, 2, 26]},
		{e: '永祚', f: [989, 8, 13], t: [990, 11, 11]},
		{e: '永延', f: [987, 4, 10], t: [989, 8, 12]},
		{e: '寛和', f: [985, 5, 2], t: [987, 4, 9]},
		{e: '永観', f: [983, 4, 20], t: [985, 5, 1]},
		{e: '天元', f: [978, 12, 4], t: [983, 4, 19]},
		{e: '貞元', f: [976, 7, 18], t: [978, 12, 3]},
		{e: '天延', f: [973, 12, 25], t: [976, 7, 17]},
		{e: '天禄', f: [970, 3, 30], t: [973, 12, 24]},
		{e: '安和', f: [968, 8, 18], t: [970, 3, 29]},
		{e: '康保', f: [964, 7, 15], t: [968, 8, 17]},
		{e: '応和', f: [961, 2, 21], t: [964, 7, 14]},
		{e: '天徳', f: [957, 11, 1], t: [961, 2, 20]},
		{e: '天暦', f: [947, 4, 27], t: [957, 10, 31]},
		{e: '天慶', f: [938, 5, 27], t: [947, 4, 26]},
		{e: '承平', f: [931, 5, 1], t: [938, 5, 26]},
		{e: '延長', f: [923, 4, 16], t: [931, 4, 30]},
		{e: '延喜', f: [901, 7, 20], t: [923, 4, 15]},
		{e: '昌泰', f: [898, 4, 30], t: [901, 7, 19]},
		{e: '寛平', f: [889, 5, 1], t: [898, 4, 29]},
		{e: '仁和', f: [885, 2, 25], t: [889, 4, 30]},
		{e: '元慶', f: [877, 4, 20], t: [885, 2, 24]},
		{e: '貞観', f: [859, 4, 19], t: [877, 4, 19]},
		{e: '天安', f: [857, 2, 25], t: [859, 4, 18]},
		{e: '斉衡', f: [854, 12, 4], t: [857, 2, 24]},
		{e: '仁寿', f: [851, 5, 2], t: [854, 12, 3]},
		{e: '嘉祥', f: [848, 6, 17], t: [851, 5, 1]},
		{e: '承和', f: [834, 1, 7], t: [848, 6, 16]},
		{e: '天長', f: [824, 1, 9], t: [834, 1, 6]},
		{e: '弘仁', f: [810, 9, 23], t: [824, 1, 8]},
		{e: '大同', f: [806, 5, 22], t: [810, 9, 22]},
		{e: '延暦', f: [782, 8, 23], t: [806, 5, 21]},
		{e: '天応', f: [781, 1, 5], t: [782, 8, 22]},
		{e: '宝亀', f: [770, 10, 5], t: [781, 1, 4]},
		{e: '神護景雲', f: [767, 8, 20], t: [770, 10, 4]},
		{e: '天平神護', f: [765, 1, 11], t: [767, 8, 19]},
		{e: '天平宝字', f: [757, 8, 22], t: [765, 1, 10]},
		{e: '天平勝宝', f: [749, 7, 6], t: [757, 8, 21]},
		{e: '天平感宝', f: [749, 4, 18], t: [749, 7, 5]},
		{e: '天平', f: [729, 8, 9], t: [749, 4, 17]},
		{e: '神亀', f: [724, 2, 8], t: [729, 8, 8]},
		{e: '養老', f: [717, 11, 21], t: [724, 2, 7]},
		{e: '霊亀', f: [715, 9, 6], t: [717, 11, 20]},
		{e: '和銅', f: [708, 1, 15], t: [715, 9, 5]},
		{e: '慶雲', f: [704, 5, 14], t: [708, 1, 14]},
		{e: '大宝', f: [701, 3, 25], t: [704, 5, 13]},
		{e: '朱鳥', f: [686, 7, 23], t: [701, 3, 24]},
		{e: '白鳳', f: [672, 1, 4], t: [686, 7, 22]},
		{e: '白雉', f: [650, 2, 18], t: [672, 1, 3]},
		{e: '大化', f: [645, 1, 4], t: [650, 2, 17]},
		{e: '西暦', f: [1, 1, 1], t: [645, 1, 3]}
	];
	for (let index = 0, count = eras.length; index < count; index++) {
		const {e: era, f: first, t: last} = eras[index];
		const from = new Date(`${String(first[0]).padStart(4, '0')}-${String(first[1]).padStart(2, '0')}-${String(first[2]).padStart(2, '0')}T00:00:00Z`);
		const to = new Date(`${String(last[0]).padStart(4, '0')}-${String(last[1]).padStart(2, '0')}-${String(last[2]).padStart(2, '0')}T00:00:00Z`);
		it(`ja-JP: ${era}[${from} -> ${to}]`, () => {
			expect(DateLocaleUtils.formatEra(from, 'ja-JP', false)).toBe(era);
			expect(DateLocaleUtils.formatEra(to, 'ja-JP', false)).toBe(era);
		});
	}
});

describe('DateLocaleUtils.formatMonth', () => {
	it('zh-CN', () => {
		expect(DateLocaleUtils.formatMonth(D, 'zh-CN', false)).toBe('7月');
	});
	it('en-US', () => {
		expect(DateLocaleUtils.formatMonth(D, 'en-US', false)).toBe('July');
	});
	it('islamic', () => {
		expect(DateLocaleUtils.formatMonth(D, 'ar-SA', false)).toBe('محرم');
	});
	it('Gregorian forced', () => {
		expect(DateLocaleUtils.formatMonth(D, 'en-US', true)).toBe('July');
	});
	it('ko-KR', () => {
		expect(DateLocaleUtils.formatMonth(D, 'ko-KR', false)).toBe('7월');
	});
	it('th-TH short', () => {
		expect(DateLocaleUtils.formatMonth(D, 'th-TH', false)).toBe('ก.ค.');
	});
	it('ru-RU short', () => {
		expect(DateLocaleUtils.formatMonth(D, 'ru-RU', false)).toBe('июл.');
	});
	it('el-GR short', () => {
		expect(DateLocaleUtils.formatMonth(D, 'el-GR', false)).toBe('Ιουλ');
	});
	it('pl-PL short', () => {
		expect(DateLocaleUtils.formatMonth(D, 'pl-PL', false)).toBe('lip');
	});
	it('hi-IN short', () => {
		expect(DateLocaleUtils.formatMonth(D, 'hi-IN', false)).toBe('आषाढ़');
	});
});

describe('DateLocaleUtils.formatDay', () => {
	it('zh-CN', () => {
		expect(DateLocaleUtils.formatDay(D, 'zh-CN', false)).toBe('6');
	});
	it('en-US', () => {
		expect(DateLocaleUtils.formatDay(D, 'en-US', false)).toBe('6');
	});
	it('islamic', () => {
		expect(DateLocaleUtils.formatDay(D, 'ar-SA', false)).toBe('١١');
	});
	it('ko-KR', () => {
		expect(DateLocaleUtils.formatDay(D, 'ko-KR', false)).toBe('6');
	});
});

describe('DateLocaleUtils.formatWeekday', () => {
	it('zh-CN', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'zh-CN', true)).toBe('日');
	});
	it('en-US', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'en-US', true)).toBe('Sun');
	});
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'ja-JP', true)).toBe('日');
	});
	it('ko-KR', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'ko-KR', true)).toBe('일');
	});

	describe('weekday Mon-Sun', () => {
		const weekdayCases: Array<[number, string, string, string, string, string]> = [
			[7, 'Monday', '一', '月', '월', 'Mon'],
			[8, 'Tuesday', '二', '火', '화', 'Tue'],
			[9, 'Wednesday', '三', '水', '수', 'Wed'],
			[10, 'Thursday', '四', '木', '목', 'Thu'],
			[11, 'Friday', '五', '金', '금', 'Fri'],
			[12, 'Saturday', '六', '土', '토', 'Sat'],
			[13, 'Sunday', '日', '日', '일', 'Sun']
		];
		for (const [day, , zh, ja, ko, en] of weekdayCases) {
			const date = new Date(2025, 6, day);
			it(`zh-CN ${date.toISOString().slice(0, 10)}`, () => {
				expect(DateLocaleUtils.formatWeekday(date, 'zh-CN', true)).toBe(zh);
			});
			it(`ja-JP ${date.toISOString().slice(0, 10)}`, () => {
				expect(DateLocaleUtils.formatWeekday(date, 'ja-JP', true)).toBe(ja);
			});
			it(`ko-KR ${date.toISOString().slice(0, 10)}`, () => {
				expect(DateLocaleUtils.formatWeekday(date, 'ko-KR', true)).toBe(ko);
			});
			it(`en-US ${date.toISOString().slice(0, 10)}`, () => {
				expect(DateLocaleUtils.formatWeekday(date, 'en-US', true)).toBe(en);
			});
		}
	});
	describe('narrow weekday', () => {
		const narrowWeekdayCases: Array<[string, string[]]> = [
			['th-TH', ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']],
			['fa-IR', ['د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی']],
			['ar-SA', ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح']],
			['lo-LA', ['ຈ', 'ອ', 'ພ', 'ພຫ', 'ສຸ', 'ສ', 'ອາ']],
			['pl-PL', ['p', 'w', 'ś', 'c', 'p', 's', 'n']],
			['my-MM', ['တ', 'အ', 'ဗ', 'က', 'သ', 'စ', 'တ']],
			['km-KH', ['ច', 'អ', 'ព', 'ព', 'ស', 'ស', 'អ']],
			['fr-FR', ['L', 'M', 'M', 'J', 'V', 'S', 'D']],
			['pt-BR', ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']]
		];
		for (const [locale, expected] of narrowWeekdayCases) {
			for (let d = 7; d <= 13; d++) {
				const date = new Date(2025, 6, d);
				it(`${locale} ${date.toISOString().slice(0, 10)}`, () => {
					expect(DateLocaleUtils.formatWeekday(date, locale, true)).toBe(expected[d - 7]);
				});
			}
		}
	});
});

describe('calendar resolution', () => {
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatEra(D, 'ja-JP', false)).toBe('令和');
	});
	it('Gregorian forced', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', true)).toBe('2025');
	});
	it('zh-TW', () => {
		expect(DateLocaleUtils.formatEra(D, 'zh-TW', false)).toBe('民國');
	});
	it('ar-SA', () => {
		expect(DateLocaleUtils.formatYear(D, 'ar-SA', false)).toBe('١٤٤٧');
	});
});

describe('cache', () => {
	it('reuses', () => {
		const a = DateLocaleUtils.formatYear(D, 'ja-JP', false);
		const b = DateLocaleUtils.formatYear(D, 'ja-JP', false);
		expect(a).toBe(b);
	});
	it('different flag', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', true)).not.toBe(DateLocaleUtils.formatYear(D, 'ja-JP', false));
	});
});

const printCalendarYears = (
	name: string, years: Array<CalendarYear>,
	possibleDaysOfYear: Array<number>, possibleDaysOfMonth: Array<number>
) => {
	const pad4 = (v: number) => String(v).padStart(4, '0');
	const pad2 = (v: number) => String(v).padStart(2, '0');
	const leap = (year: number): boolean => {
		return year % 400 === 0 || (year % 4 === 0 && year % 100 != 0);
	};
	const daysOfMonth = (year: number, month: number): number => {
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			return 31;
		} else if ([4, 6, 9, 11].includes(month)) {
			return 30;
		} else if (leap(year)) {
			return 29;
		} else {
			return 28;
		}
	};
	const daysOf = (first: GregoryDay, last: GregoryDay) => {
		let days: number;
		if (first.year === last.year) {
			if (first.month === last.month) {
				days = last.day - first.day + 1;
			} else {
				days = last.day
					+ (daysOfMonth(first.year, first.month) - first.day + 1)
					+ [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
						.filter(m => m > first.month && m < last.month)
						.reduce((days, m) => days + daysOfMonth(first.year, m), 0);
			}
		} else {
			days = (daysOfMonth(first.year, first.month) - first.day + 1)
				+ [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
					.filter(m => m > first.month)
					.reduce((days, m) => days + daysOfMonth(first.year, m), 0)
				+ (() => {
					let days = 0;
					for (let year = first.year + 1; year < last.year; year++) {
						days += leap(year) ? 366 : 365;
					}
					return days;
				})()
				+ [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
					.filter(m => m < last.month)
					.reduce((days, m) => days + daysOfMonth(last.year, m), 0)
				+ last.day;
		}

		if (!possibleDaysOfMonth.includes(days)) {
			return {days, content: ` [${days} days, not regular days of month]`};
		} else {
			return {days, content: ` [${days} days]`};
		}
	};
	const sameCalendarAndGregory = (calendar: CalendarDay, gregory: GregoryDay): boolean => {
		return calendar.month === gregory.month && calendar.day === gregory.day;
	};
	const same = (month: AMonth): string => {
		const firstSame = sameCalendarAndGregory(month.first.calendar, month.first.gregory);
		const lastSame = sameCalendarAndGregory(month.last.calendar, month.last.gregory);

		if (firstSame) {
			if (lastSame) {
				return '';
			} else {
				return ` [Last day not same]`;
			}
		} else if (lastSame) {
			return ` [First day not same]`;
		} else {
			return ` [First and last day both not same]`;
		}
	};
	const content = years.map(year => {
		const months = year.months.map(month => {
			const {days: daysOfMonth, content: daysContent} = daysOf(month.first.gregory, month.last.gregory);
			return {
				days: daysOfMonth,
				content: [
					'\t- ',
					pad2(month.first.calendar.month),
					'-',
					pad2(month.first.calendar.day),
					' (',
					pad4(month.first.gregory.year),
					'-',
					pad2(month.first.gregory.month),
					'-',
					pad2(month.first.gregory.day),
					') ~ ',
					pad2(month.last.calendar.month),
					'-',
					pad2(month.last.calendar.day),
					' (',
					pad4(month.last.gregory.year),
					'-',
					pad2(month.last.gregory.month),
					'-',
					pad2(month.last.gregory.day),
					')',
					daysContent,
					same(month)
				].join('')
			};
		});
		const m = `[${year.months.length} months]`;
		const daysOfYear = months.reduce((days, m) => days + m.days, 0);
		const d = possibleDaysOfYear.includes(daysOfYear) ? `[${daysOfYear} days]` : `[${daysOfYear} days, not regular days of year]`;
		return [
			`- ${name} [${year.months[0].last.calendar.year}] ${m} ${d}`,
			months.map(m => m.content).join('\n')
		].join('\n');
	}).join('\n');
	writeFileSync(path.join(__dirname, `calendar-months-${name.toLowerCase().replaceAll(' ', '_')}.txt`), `# [${name}]\n` + content);
};

describe('calendar year boundaries', () => {
	it('Buddhist', () => {
		printCalendarYears('Buddhist', DateMoveUtils.calendarYearsOfBuddhist(), [365, 366], [28, 29, 30, 31]);
	});
	it('Coptic', () => {
		printCalendarYears('Coptic', DateMoveUtils.calendarYearsOfCoptic(), [365, 366], [5, 6, 30]);
	});
	it('Ethiopic', () => {
		printCalendarYears('Ethiopic_Am-ET', DateMoveUtils.calendarYearsOfEthiopic_Am_ET(), [365, 366], [5, 6, 30]);
		printCalendarYears('Ethiopic_Ai-ET', DateMoveUtils.calendarYearsOfEthiopic_Ti_ET(), [365, 366], [5, 6, 30]);
	});
	it('Hebrew', () => {
		printCalendarYears('Hebrew', DateMoveUtils.calendarYearsOfHebrew(), [353, 354, 355, 383, 384, 385], [29, 30]);
	});
	it('Indian', () => {
		printCalendarYears('Indian', DateMoveUtils.calendarYearsOfIndian(), [365, 366], [30, 31]);
	});
	it('Islamic', () => {
		printCalendarYears('Islamic', DateMoveUtils.calendarYearsOfIslamic(), [353, 354, 355], [29, 30]);
	});
	it('Islamic Civil', () => {
		printCalendarYears('Islamic Civil', DateMoveUtils.calendarYearsOfIslamicCivil(), [354, 355], [29, 30]);
	});
	it('Islamic Umalqura', () => {
		printCalendarYears('Islamic Umalqura', DateMoveUtils.calendarYearsOfIslamicUmalqura(), [354, 355], [29, 30]);
	});
	it('Japanese', () => {
		printCalendarYears('Japanese', DateMoveUtils.calendarYearsOfJapanese(), [365, 366], [28, 29, 30, 31]);
	});
	it('Persian', () => {
		printCalendarYears('Persian_Ckb-IR', DateMoveUtils.calendarYearsOfPersian_Ckb_IR(), [365, 366], [28, 29, 30, 31]);
		printCalendarYears('Persian_Fa-IR', DateMoveUtils.calendarYearsOfPersian_Fa_IR(), [365, 366], [28, 29, 30, 31]);
		printCalendarYears('Persian_Lrc-IR', DateMoveUtils.calendarYearsOfPersian_Lrc_IR(), [365, 366], [28, 29, 30, 31]);
		printCalendarYears('Persian_Maz-IR', DateMoveUtils.calendarYearsOfPersian_Mzn_IR(), [365, 366], [28, 29, 30, 31]);
		printCalendarYears('Persian_Ps-AF', DateMoveUtils.calendarYearsOfPersian_Ps_AF(), [365, 366], [28, 29, 30, 31]);
		printCalendarYears('Persian_Uz-Arab-AF', DateMoveUtils.calendarYearsOfPersian_Uz_Arab_AF(), [365, 366], [28, 29, 30, 31]);
	});
	it('Taiwan ROC', () => {
		printCalendarYears('TW ROC', DateMoveUtils.calendarYearsOfTaiwanRoc(), [365, 366], [28, 29, 30, 31]);
	});
});
