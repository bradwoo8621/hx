import {describe, expect, it} from 'vite-plus/test';
import {DateLocaleUtils} from '../src';

const D = new Date(2025, 6, 6, 15, 30, 45);

describe('DateLocaleUtils.formatYear', () => {
	it('Gregorian', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', true)).toBe('2025');
	});
	it('zh-CN', () => {
		expect(DateLocaleUtils.formatYear(D, 'zh-CN', false)).toBe('2025年');
	});
	it('en-US', () => {
		expect(DateLocaleUtils.formatYear(D, 'en-US', false)).toBe('2025');
	});
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', false)).toBe('7年');
	});
	it('zh-TW', () => {
		expect(DateLocaleUtils.formatYear(D, 'zh-TW', false)).toBe('114年');
	});
	it('islamic', () => {
		expect(DateLocaleUtils.formatYear(D, 'ar-SA', 'islamic-umalqura')).toBe('\u0661\u0664\u0664\u0667');
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
		expect(DateLocaleUtils.formatEra(D, 'zh-TW', false)).toBe('\u6c11\u570b');
	});
	it('ROC pre-1912', () => {
		expect(DateLocaleUtils.formatEra(new Date(1911, 11, 31), 'zh-TW', false)).toBe('\u6c11\u570b\u524d');
	});
});

describe('Japanese era boundaries', () => {
	const eras: Array<[string, Date, Date]> = [
		['令和', new Date(Date.UTC(2019, 4, 1)), new Date()],
		['平成', new Date(Date.UTC(1989, 0, 8)), new Date(Date.UTC(2019, 3, 30))],
		['昭和', new Date(Date.UTC(1926, 11, 25)), new Date(Date.UTC(1989, 0, 7))],
		['大正', new Date(Date.UTC(1912, 6, 30)), new Date(Date.UTC(1926, 11, 24))],
		['明治', new Date(Date.UTC(1868, 9, 23)), new Date(Date.UTC(1912, 6, 29))],
		['慶応', new Date(Date.UTC(1865, 3, 7)), new Date(Date.UTC(1868, 9, 22))],
		['元治', new Date(Date.UTC(1864, 1, 20)), new Date(Date.UTC(1865, 3, 6))],
		['文久', new Date(Date.UTC(1861, 1, 19)), new Date(Date.UTC(1864, 1, 19))],
		['万延', new Date(Date.UTC(1860, 2, 18)), new Date(Date.UTC(1861, 1, 18))],
		['安政', new Date(Date.UTC(1854, 10, 27)), new Date(Date.UTC(1860, 2, 17))],
		['嘉永', new Date(Date.UTC(1848, 1, 28)), new Date(Date.UTC(1854, 10, 26))],
		['弘化', new Date(Date.UTC(1844, 11, 2)), new Date(Date.UTC(1848, 1, 27))],
		['天保', new Date(Date.UTC(1830, 11, 10)), new Date(Date.UTC(1844, 11, 1))],
		['文政', new Date(Date.UTC(1818, 3, 22)), new Date(Date.UTC(1830, 11, 9))],
		['文化', new Date(Date.UTC(1804, 1, 11)), new Date(Date.UTC(1818, 3, 21))],
		['享和', new Date(Date.UTC(1801, 1, 5)), new Date(Date.UTC(1804, 1, 10))],
		['寛政', new Date(Date.UTC(1789, 0, 25)), new Date(Date.UTC(1801, 1, 4))],
		['天明', new Date(Date.UTC(1781, 3, 2)), new Date(Date.UTC(1789, 0, 24))],
		['安永', new Date(Date.UTC(1772, 10, 16)), new Date(Date.UTC(1781, 3, 1))],
		['明和', new Date(Date.UTC(1764, 5, 2)), new Date(Date.UTC(1772, 10, 15))],
		['宝暦', new Date(Date.UTC(1751, 9, 27)), new Date(Date.UTC(1764, 5, 1))],
		['寛延', new Date(Date.UTC(1748, 6, 12)), new Date(Date.UTC(1751, 9, 26))],
		['延享', new Date(Date.UTC(1744, 1, 21)), new Date(Date.UTC(1748, 6, 11))],
		['寛保', new Date(Date.UTC(1741, 1, 27)), new Date(Date.UTC(1744, 1, 20))],
		['元文', new Date(Date.UTC(1736, 3, 28)), new Date(Date.UTC(1741, 1, 26))],
		['享保', new Date(Date.UTC(1716, 5, 22)), new Date(Date.UTC(1736, 3, 27))],
		['正徳', new Date(Date.UTC(1711, 3, 25)), new Date(Date.UTC(1716, 5, 21))],
		['宝永', new Date(Date.UTC(1704, 2, 13)), new Date(Date.UTC(1711, 3, 24))],
		['元禄', new Date(Date.UTC(1688, 8, 30)), new Date(Date.UTC(1704, 2, 12))],
		['貞享', new Date(Date.UTC(1684, 1, 21)), new Date(Date.UTC(1688, 8, 29))],
		['天和', new Date(Date.UTC(1681, 8, 29)), new Date(Date.UTC(1684, 1, 20))],
		['延宝', new Date(Date.UTC(1673, 8, 21)), new Date(Date.UTC(1681, 8, 28))],
		['寛文', new Date(Date.UTC(1661, 3, 25)), new Date(Date.UTC(1673, 8, 20))],
		['万治', new Date(Date.UTC(1658, 6, 23)), new Date(Date.UTC(1661, 3, 24))],
		['明暦', new Date(Date.UTC(1655, 3, 13)), new Date(Date.UTC(1658, 6, 22))],
		['承応', new Date(Date.UTC(1652, 8, 18)), new Date(Date.UTC(1655, 3, 12))],
		['慶安', new Date(Date.UTC(1648, 1, 15)), new Date(Date.UTC(1652, 8, 17))],
		['正保', new Date(Date.UTC(1644, 11, 16)), new Date(Date.UTC(1648, 1, 14))],
		['寛永', new Date(Date.UTC(1624, 2, 1)), new Date(Date.UTC(1644, 11, 15))],
		['元和', new Date(Date.UTC(1615, 6, 13)), new Date(Date.UTC(1624, 1, 29))],
		['慶長', new Date(Date.UTC(1596, 9, 27)), new Date(Date.UTC(1615, 6, 12))],
		['文禄', new Date(Date.UTC(1592, 11, 8)), new Date(Date.UTC(1596, 9, 26))],
		['天正', new Date(Date.UTC(1573, 7, 7)), new Date(Date.UTC(1592, 11, 7))],
		['元亀', new Date(Date.UTC(1570, 4, 3)), new Date(Date.UTC(1573, 7, 6))],
		['永禄', new Date(Date.UTC(1558, 2, 10)), new Date(Date.UTC(1570, 4, 2))],
		['弘治', new Date(Date.UTC(1555, 10, 2)), new Date(Date.UTC(1558, 2, 9))],
		['天文', new Date(Date.UTC(1532, 7, 8)), new Date(Date.UTC(1555, 10, 1))],
		['享禄', new Date(Date.UTC(1528, 7, 30)), new Date(Date.UTC(1532, 7, 7))],
		['大永', new Date(Date.UTC(1521, 8, 2)), new Date(Date.UTC(1528, 7, 29))],
		['永正', new Date(Date.UTC(1504, 2, 11)), new Date(Date.UTC(1521, 8, 1))],
		['文亀', new Date(Date.UTC(1501, 2, 11)), new Date(Date.UTC(1504, 2, 10))],
		['明応', new Date(Date.UTC(1492, 6, 28)), new Date(Date.UTC(1501, 2, 10))],
		['延徳', new Date(Date.UTC(1489, 7, 30)), new Date(Date.UTC(1492, 6, 27))],
		['長享', new Date(Date.UTC(1487, 7, 7)), new Date(Date.UTC(1489, 7, 29))],
		['文明', new Date(Date.UTC(1469, 4, 7)), new Date(Date.UTC(1487, 7, 6))],
		['応仁', new Date(Date.UTC(1467, 2, 12)), new Date(Date.UTC(1469, 4, 6))],
		['文正', new Date(Date.UTC(1466, 2, 9)), new Date(Date.UTC(1467, 2, 11))],
		['寛正', new Date(Date.UTC(1460, 11, 30)), new Date(Date.UTC(1466, 2, 8))],
		['長禄', new Date(Date.UTC(1457, 9, 7)), new Date(Date.UTC(1460, 11, 29))],
		['康正', new Date(Date.UTC(1455, 7, 3)), new Date(Date.UTC(1457, 9, 6))],
		['享徳', new Date(Date.UTC(1452, 7, 3)), new Date(Date.UTC(1455, 7, 2))],
		['宝徳', new Date(Date.UTC(1449, 7, 6)), new Date(Date.UTC(1452, 7, 2))],
		['文安', new Date(Date.UTC(1444, 1, 14)), new Date(Date.UTC(1449, 7, 5))],
		['嘉吉', new Date(Date.UTC(1441, 1, 26)), new Date(Date.UTC(1444, 1, 13))],
		['永享', new Date(Date.UTC(1429, 8, 14)), new Date(Date.UTC(1441, 1, 25))],
		['正長', new Date(Date.UTC(1428, 4, 6)), new Date(Date.UTC(1429, 8, 13))],
		['応永', new Date(Date.UTC(1394, 6, 13)), new Date(Date.UTC(1428, 4, 5))],
		['明徳', new Date(Date.UTC(1390, 3, 3)), new Date(Date.UTC(1394, 6, 12))],
		['康応', new Date(Date.UTC(1389, 1, 17)), new Date(Date.UTC(1390, 3, 2))],
		/* TODO */ ['嘉慶', new Date(Date.UTC(1387, 7, 31)), new Date(Date.UTC(1389, 1, 16))],
		['弘和', new Date(Date.UTC(1381, 1, 18)), new Date(Date.UTC(1384, 4, 5))],
		['康暦', new Date(Date.UTC(1379, 2, 30)), new Date(Date.UTC(1381, 1, 17))],
		['天授', new Date(Date.UTC(1375, 5, 4)), new Date(Date.UTC(1379, 2, 29))],
		['文中', new Date(Date.UTC(1372, 3, 9)), new Date(Date.UTC(1375, 5, 3))],
		['建徳', new Date(Date.UTC(1370, 7, 1)), new Date(Date.UTC(1372, 3, 8))],
		['正平', new Date(Date.UTC(1346, 11, 16)), new Date(Date.UTC(1370, 6, 31))],
		['興国', new Date(Date.UTC(1340, 4, 6)), new Date(Date.UTC(1346, 11, 15))],
		['延元', new Date(Date.UTC(1336, 2, 8)), new Date(Date.UTC(1340, 4, 5))],
		['建武', new Date(Date.UTC(1334, 1, 6)), new Date(Date.UTC(1336, 2, 7))],
		['元弘', new Date(Date.UTC(1331, 7, 17)), new Date(Date.UTC(1334, 1, 5))],
		['元徳', new Date(Date.UTC(1329, 8, 6)), new Date(Date.UTC(1331, 7, 16))],
		['嘉暦', new Date(Date.UTC(1326, 4, 4)), new Date(Date.UTC(1329, 8, 5))],
		['正中', new Date(Date.UTC(1324, 11, 17)), new Date(Date.UTC(1326, 4, 3))],
		['元亨', new Date(Date.UTC(1321, 2, 3)), new Date(Date.UTC(1324, 11, 16))],
		['元応', new Date(Date.UTC(1319, 4, 6)), new Date(Date.UTC(1321, 2, 2))],
		['文保', new Date(Date.UTC(1317, 1, 11)), new Date(Date.UTC(1319, 4, 5))],
		['正和', new Date(Date.UTC(1312, 2, 28)), new Date(Date.UTC(1317, 1, 10))],
		['応長', new Date(Date.UTC(1311, 4, 6)), new Date(Date.UTC(1312, 2, 27))],
		['延慶', new Date(Date.UTC(1308, 9, 17)), new Date(Date.UTC(1311, 4, 5))],
		['徳治', new Date(Date.UTC(1306, 11, 22)), new Date(Date.UTC(1308, 9, 16))],
		['嘉元', new Date(Date.UTC(1303, 7, 13)), new Date(Date.UTC(1306, 11, 21))],
		['乾元', new Date(Date.UTC(1302, 10, 29)), new Date(Date.UTC(1303, 7, 12))],
		['正安', new Date(Date.UTC(1299, 4, 2)), new Date(Date.UTC(1302, 10, 28))],
		['永仁', new Date(Date.UTC(1293, 7, 12)), new Date(Date.UTC(1299, 4, 1))],
		['正応', new Date(Date.UTC(1288, 4, 5)), new Date(Date.UTC(1293, 7, 11))],
		['弘安', new Date(Date.UTC(1278, 2, 8)), new Date(Date.UTC(1288, 4, 4))],
		['建治', new Date(Date.UTC(1275, 4, 2)), new Date(Date.UTC(1278, 2, 7))],
		['文永', new Date(Date.UTC(1264, 2, 6)), new Date(Date.UTC(1275, 4, 1))],
		['弘長', new Date(Date.UTC(1261, 1, 27)), new Date(Date.UTC(1264, 2, 5))],
		['文応', new Date(Date.UTC(1260, 3, 20)), new Date(Date.UTC(1261, 1, 26))],
		['正元', new Date(Date.UTC(1259, 3, 2)), new Date(Date.UTC(1260, 3, 19))],
		/* TODO */ ['正嘉', new Date(Date.UTC(1257, 2, 21)), new Date(Date.UTC(1259, 3, 1))],
		['宝治', new Date(Date.UTC(1247, 2, 7)), new Date(Date.UTC(1249, 2, 24))],
		['寛元', new Date(Date.UTC(1243, 2, 5)), new Date(Date.UTC(1247, 2, 6))],
		['仁治', new Date(Date.UTC(1240, 6, 23)), new Date(Date.UTC(1243, 2, 4))],
		/* TODO */ ['延応', new Date(Date.UTC(1239, 1, 14)), new Date(Date.UTC(1240, 6, 22))],
		['文暦', new Date(Date.UTC(1234, 10, 12)), new Date(Date.UTC(1235, 8, 25))],
		['天福', new Date(Date.UTC(1233, 3, 22)), new Date(Date.UTC(1234, 10, 11))],
		['貞永', new Date(Date.UTC(1232, 3, 9)), new Date(Date.UTC(1233, 3, 21))],
		['寛喜', new Date(Date.UTC(1229, 2, 12)), new Date(Date.UTC(1232, 3, 8))],
		['安貞', new Date(Date.UTC(1227, 11, 17)), new Date(Date.UTC(1229, 2, 11))],
		/* TODO */ ['嘉禄', new Date(Date.UTC(1225, 3, 27)), new Date(Date.UTC(1227, 11, 16))],
		['承久', new Date(Date.UTC(1219, 3, 19)), new Date(Date.UTC(1222, 3, 19))],
		['建保', new Date(Date.UTC(1213, 11, 13)), new Date(Date.UTC(1219, 3, 18))],
		['建暦', new Date(Date.UTC(1211, 2, 16)), new Date(Date.UTC(1213, 11, 12))],
		['承元', new Date(Date.UTC(1207, 10, 1)), new Date(Date.UTC(1211, 2, 15))],
		['建永', new Date(Date.UTC(1206, 4, 4)), new Date(Date.UTC(1207, 9, 31))],
		['元久', new Date(Date.UTC(1204, 1, 27)), new Date(Date.UTC(1206, 4, 3))],
		['建仁', new Date(Date.UTC(1201, 1, 20)), new Date(Date.UTC(1204, 1, 26))],
		['正治', new Date(Date.UTC(1199, 4, 4)), new Date(Date.UTC(1201, 1, 19))],
		['建久', new Date(Date.UTC(1190, 3, 18)), new Date(Date.UTC(1199, 4, 3))],
		['文治', new Date(Date.UTC(1185, 7, 21)), new Date(Date.UTC(1190, 3, 17))],
		['元暦', new Date(Date.UTC(1184, 3, 23)), new Date(Date.UTC(1185, 7, 20))],
		/* TODO */ ['寿永', new Date(Date.UTC(1182, 5, 3)), new Date(Date.UTC(1184, 3, 22))],
		['安元', new Date(Date.UTC(1175, 7, 4)), new Date(Date.UTC(1177, 7, 10))],
		['承安', new Date(Date.UTC(1171, 3, 28)), new Date(Date.UTC(1175, 7, 3))],
		['嘉応', new Date(Date.UTC(1169, 3, 15)), new Date(Date.UTC(1171, 3, 27))],
		['仁安', new Date(Date.UTC(1166, 8, 3)), new Date(Date.UTC(1169, 3, 14))],
		['永万', new Date(Date.UTC(1165, 5, 12)), new Date(Date.UTC(1166, 8, 2))],
		['長寛', new Date(Date.UTC(1163, 3, 5)), new Date(Date.UTC(1165, 5, 11))],
		['応保', new Date(Date.UTC(1161, 8, 11)), new Date(Date.UTC(1163, 3, 4))],
		['永暦', new Date(Date.UTC(1160, 0, 17)), new Date(Date.UTC(1161, 8, 10))],
		['平治', new Date(Date.UTC(1159, 3, 27)), new Date(Date.UTC(1160, 0, 16))],
		['保元', new Date(Date.UTC(1156, 4, 4)), new Date(Date.UTC(1159, 3, 26))],
		['久寿', new Date(Date.UTC(1154, 10, 4)), new Date(Date.UTC(1156, 4, 3))],
		['仁平', new Date(Date.UTC(1151, 1, 2)), new Date(Date.UTC(1154, 10, 3))],
		['久安', new Date(Date.UTC(1145, 6, 29)), new Date(Date.UTC(1151, 1, 1))],
		['天養', new Date(Date.UTC(1144, 2, 1)), new Date(Date.UTC(1145, 6, 28))],
		/* TODO */ ['康治', new Date(Date.UTC(1142, 4, 5)), new Date(Date.UTC(1144, 1, 29))],
		['長承', new Date(Date.UTC(1132, 7, 18)), new Date(Date.UTC(1135, 4, 3))],
		['天承', new Date(Date.UTC(1131, 1, 5)), new Date(Date.UTC(1132, 7, 17))],
		['大治', new Date(Date.UTC(1126, 0, 29)), new Date(Date.UTC(1131, 1, 4))],
		['天治', new Date(Date.UTC(1124, 3, 10)), new Date(Date.UTC(1126, 0, 28))],
		['保安', new Date(Date.UTC(1120, 3, 17)), new Date(Date.UTC(1124, 3, 9))],
		['元永', new Date(Date.UTC(1118, 3, 10)), new Date(Date.UTC(1120, 3, 16))],
		['永久', new Date(Date.UTC(1113, 6, 20)), new Date(Date.UTC(1118, 3, 9))],
		['天永', new Date(Date.UTC(1110, 6, 20)), new Date(Date.UTC(1113, 6, 19))],
		['天仁', new Date(Date.UTC(1108, 7, 10)), new Date(Date.UTC(1110, 6, 19))],
		['嘉承', new Date(Date.UTC(1106, 3, 16)), new Date(Date.UTC(1108, 7, 9))],
		['長治', new Date(Date.UTC(1104, 1, 17)), new Date(Date.UTC(1106, 3, 15))],
		['康和', new Date(Date.UTC(1099, 8, 3)), new Date(Date.UTC(1104, 1, 16))],
		['承徳', new Date(Date.UTC(1097, 10, 27)), new Date(Date.UTC(1099, 8, 2))],
		['永長', new Date(Date.UTC(1096, 11, 23)), new Date(Date.UTC(1097, 10, 26))],
		['嘉保', new Date(Date.UTC(1094, 11, 21)), new Date(Date.UTC(1096, 11, 22))],
		['寛治', new Date(Date.UTC(1087, 3, 13)), new Date(Date.UTC(1094, 11, 20))],
		['応徳', new Date(Date.UTC(1084, 1, 13)), new Date(Date.UTC(1087, 3, 12))],
		['永保', new Date(Date.UTC(1081, 1, 16)), new Date(Date.UTC(1084, 1, 12))],
		['承暦', new Date(Date.UTC(1077, 10, 23)), new Date(Date.UTC(1081, 1, 15))],
		['承保', new Date(Date.UTC(1074, 7, 29)), new Date(Date.UTC(1077, 10, 22))],
		['延久', new Date(Date.UTC(1069, 3, 19)), new Date(Date.UTC(1074, 7, 28))],
		['治暦', new Date(Date.UTC(1065, 7, 8)), new Date(Date.UTC(1069, 3, 18))],
		['康平', new Date(Date.UTC(1058, 8, 4)), new Date(Date.UTC(1065, 7, 7))],
		['天喜', new Date(Date.UTC(1053, 0, 17)), new Date(Date.UTC(1058, 8, 3))],
		['永承', new Date(Date.UTC(1046, 3, 20)), new Date(Date.UTC(1053, 0, 16))],
		['寛徳', new Date(Date.UTC(1044, 10, 30)), new Date(Date.UTC(1046, 3, 19))],
		['長久', new Date(Date.UTC(1040, 10, 16)), new Date(Date.UTC(1044, 10, 29))],
		['長暦', new Date(Date.UTC(1037, 3, 27)), new Date(Date.UTC(1040, 10, 15))],
		['長元', new Date(Date.UTC(1028, 6, 31)), new Date(Date.UTC(1037, 3, 26))],
		['万寿', new Date(Date.UTC(1024, 6, 19)), new Date(Date.UTC(1028, 6, 30))],
		['治安', new Date(Date.UTC(1021, 1, 8)), new Date(Date.UTC(1024, 6, 18))],
		['寛仁', new Date(Date.UTC(1017, 3, 29)), new Date(Date.UTC(1021, 1, 7))],
		['長和', new Date(Date.UTC(1012, 11, 31)), new Date(Date.UTC(1017, 3, 28))],
		['寛弘', new Date(Date.UTC(1004, 6, 26)), new Date(Date.UTC(1012, 11, 30))],
		['長保', new Date(Date.UTC(999, 0, 18)), new Date(Date.UTC(1004, 6, 25))],
		['長徳', new Date(Date.UTC(995, 1, 27)), new Date(Date.UTC(999, 0, 17))],
		['正暦', new Date(Date.UTC(990, 10, 12)), new Date(Date.UTC(995, 1, 26))],
		['永祚', new Date(Date.UTC(989, 7, 13)), new Date(Date.UTC(990, 10, 11))],
		['永延', new Date(Date.UTC(987, 3, 10)), new Date(Date.UTC(989, 7, 12))],
		['寛和', new Date(Date.UTC(985, 4, 2)), new Date(Date.UTC(987, 3, 9))],
		['永観', new Date(Date.UTC(983, 3, 20)), new Date(Date.UTC(985, 4, 1))],
		['天元', new Date(Date.UTC(978, 11, 4)), new Date(Date.UTC(983, 3, 19))],
		['貞元', new Date(Date.UTC(976, 6, 18)), new Date(Date.UTC(978, 11, 3))],
		['天延', new Date(Date.UTC(973, 11, 25)), new Date(Date.UTC(976, 6, 17))],
		['天禄', new Date(Date.UTC(970, 2, 30)), new Date(Date.UTC(973, 11, 24))],
		['安和', new Date(Date.UTC(968, 7, 18)), new Date(Date.UTC(970, 2, 29))],
		['康保', new Date(Date.UTC(964, 6, 15)), new Date(Date.UTC(968, 7, 17))],
		['応和', new Date(Date.UTC(961, 1, 21)), new Date(Date.UTC(964, 6, 14))],
		['天徳', new Date(Date.UTC(957, 10, 1)), new Date(Date.UTC(961, 1, 20))],
		['天暦', new Date(Date.UTC(947, 3, 27)), new Date(Date.UTC(957, 9, 31))],
		['天慶', new Date(Date.UTC(938, 4, 27)), new Date(Date.UTC(947, 3, 26))],
		['承平', new Date(Date.UTC(931, 4, 1)), new Date(Date.UTC(938, 4, 26))],
		['延長', new Date(Date.UTC(923, 3, 16)), new Date(Date.UTC(931, 3, 30))],
		['延喜', new Date(Date.UTC(901, 6, 20)), new Date(Date.UTC(923, 3, 15))],
		['昌泰', new Date(Date.UTC(898, 3, 30)), new Date(Date.UTC(901, 6, 19))],
		['寛平', new Date(Date.UTC(889, 4, 1)), new Date(Date.UTC(898, 3, 29))],
		['仁和', new Date(Date.UTC(885, 1, 25)), new Date(Date.UTC(889, 3, 30))],
		['元慶', new Date(Date.UTC(877, 3, 20)), new Date(Date.UTC(885, 1, 24))],
		['貞観', new Date(Date.UTC(859, 3, 19)), new Date(Date.UTC(877, 3, 19))],
		['天安', new Date(Date.UTC(857, 1, 25)), new Date(Date.UTC(859, 3, 18))],
		['斉衡', new Date(Date.UTC(854, 11, 4)), new Date(Date.UTC(857, 1, 24))],
		['仁寿', new Date(Date.UTC(851, 4, 2)), new Date(Date.UTC(854, 11, 3))],
		['嘉祥', new Date(Date.UTC(848, 5, 17)), new Date(Date.UTC(851, 4, 1))],
		['承和', new Date(Date.UTC(834, 0, 7)), new Date(Date.UTC(848, 5, 16))],
		['天長', new Date(Date.UTC(824, 0, 9)), new Date(Date.UTC(834, 0, 6))],
		['弘仁', new Date(Date.UTC(810, 8, 23)), new Date(Date.UTC(824, 0, 8))],
		['大同', new Date(Date.UTC(806, 4, 22)), new Date(Date.UTC(810, 8, 22))],
		['延暦', new Date(Date.UTC(782, 7, 23)), new Date(Date.UTC(806, 4, 21))],
		['天応', new Date(Date.UTC(781, 0, 5)), new Date(Date.UTC(782, 7, 22))],
		['宝亀', new Date(Date.UTC(770, 9, 5)), new Date(Date.UTC(781, 0, 4))],
		['神護景雲', new Date(Date.UTC(767, 7, 20)), new Date(Date.UTC(770, 9, 4))],
		['天平神護', new Date(Date.UTC(765, 0, 11)), new Date(Date.UTC(767, 7, 19))],
		['天平宝字', new Date(Date.UTC(757, 7, 22)), new Date(Date.UTC(765, 0, 10))],
		['天平勝宝', new Date(Date.UTC(749, 6, 6)), new Date(Date.UTC(757, 7, 21))],
		['天平感宝', new Date(Date.UTC(749, 3, 18)), new Date(Date.UTC(749, 6, 5))],
		['天平', new Date(Date.UTC(729, 7, 9)), new Date(Date.UTC(749, 3, 17))],
		['神亀', new Date(Date.UTC(724, 1, 8)), new Date(Date.UTC(729, 7, 8))],
		['養老', new Date(Date.UTC(717, 10, 21)), new Date(Date.UTC(724, 1, 7))],
		['霊亀', new Date(Date.UTC(715, 8, 6)), new Date(Date.UTC(717, 10, 20))],
		['和銅', new Date(Date.UTC(708, 0, 15)), new Date(Date.UTC(715, 8, 5))],
		['慶雲', new Date(Date.UTC(704, 4, 14)), new Date(Date.UTC(708, 0, 14))],
		['大宝', new Date(Date.UTC(701, 2, 25)), new Date(Date.UTC(704, 4, 13))],
		['朱鳥', new Date(Date.UTC(686, 6, 23)), new Date(Date.UTC(701, 2, 24))],
		['白鳳', new Date(Date.UTC(672, 0, 4)), new Date(Date.UTC(686, 6, 22))],
		['白雉', new Date(Date.UTC(650, 1, 18)), new Date(Date.UTC(672, 0, 3))],
		['大化', new Date(Date.UTC(600, 0, 1)), new Date(Date.UTC(650, 1, 17))]
	];
	for (let index = 0, count = eras.length; index < count; index++) {
		const [era, first, last] = eras[index];
		it(`\${era}`, () => {
			expect(DateLocaleUtils.formatEra(first, 'ja-JP', false)).toBe(era);
			expect(DateLocaleUtils.formatEra(last, 'ja-JP', false)).toBe(era);

			if (eras[index + 1] != null) {
				const [, , prevLast] = eras[index + 1];
				if ((first.getTime() - prevLast.getTime()) !== 86400000) {
					throw new Error(`${era} start is not prev+1 day`);
				}
			}
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
		expect(DateLocaleUtils.formatMonth(D, 'ar-SA', 'islamic-umalqura')).toBe('\u0645\u062d\u0631\u0645');
	});
	it('Gregorian forced', () => {
		expect(DateLocaleUtils.formatMonth(D, 'en-US', true)).toBe('July');
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
		expect(DateLocaleUtils.formatDay(D, 'ar-SA', 'islamic-umalqura')).toBe('\u0661\u0661');
	});
});

describe('DateLocaleUtils.formatWeekday', () => {
	it('zh-CN', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'zh-CN', true)).toBe('\u65e5');
	});
	it('en-US', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'en-US', true)).toBe('Sun');
	});
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatWeekday(D, 'ja-JP', true)).toBe('\u65e5');
	});
});

describe('calendar resolution', () => {
	it('ja-JP', () => {
		expect(DateLocaleUtils.formatEra(D, 'ja-JP', false)).toBe('\u4ee4\u548c');
	});
	it('Gregorian forced', () => {
		expect(DateLocaleUtils.formatYear(D, 'ja-JP', true)).toBe('2025');
	});
	it('zh-TW', () => {
		expect(DateLocaleUtils.formatEra(D, 'zh-TW', false)).toBe('\u6c11\u570b');
	});
	it('ar-SA', () => {
		expect(DateLocaleUtils.formatYear(D, 'ar-SA', 'islamic-umalqura')).toBe('\u0661\u0664\u0664\u0667');
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