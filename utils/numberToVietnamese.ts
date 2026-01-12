const chuSo = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function docBlock(so: number, daydu: boolean) {
  let str = '';
  const tram = Math.floor(so / 100);
  const chuc = Math.floor((so % 100) / 10);
  const donvi = so % 10;

  if (tram > 0 || daydu) {
    str += chuSo[tram] + ' trăm';
    str += (chuc === 0 && donvi !== 0) ? ' linh' : '';
  }

  if (chuc !== 0) {
    str += (str ? ' ' : '') + (chuc === 1 ? 'mười' : chuSo[chuc] + ' mươi');
  }

  if (donvi !== 0) {
    str += (str ? ' ' : '');
    if (chuc > 1 && donvi === 1) {
      str += 'mốt';
    } else if (chuc > 0 && donvi === 5) {
      str += 'lăm';
    } else if (chuc > 1 && donvi === 4) {
      str += 'tư';
    } else {
      str += chuSo[donvi];
    }
  }

  return str;
}

function docHangTrieu(so: number, daydu: boolean) {
  let str = '';
  const trieu = Math.floor(so / 1000000);
  let soConLai = so % 1000000;

  if (trieu > 0) {
    str += docBlock(trieu, daydu) + ' triệu';
    daydu = true;
  }

  const nghin = Math.floor(soConLai / 1000);
  soConLai = soConLai % 1000;

  if (nghin > 0) {
    str += (str ? ', ' : '') + docBlock(nghin, daydu) + ' nghìn';
    daydu = true;
  }

  if (soConLai > 0) {
    str += (str ? ', ' : '') + docBlock(soConLai, daydu);
  }

  return str;
}

export function readMoney(number: number): string {
  if (number === 0) return 'Không đồng';
  
  let str = '';
  let suffix = '';
  let tempNumber = number;
  
  if (number < 0) {
    str = 'Âm ';
    tempNumber = Math.abs(number);
  }

  let i = 0;
  while (tempNumber > 0) {
    const phanDu = tempNumber % 1000000000;
    tempNumber = Math.floor(tempNumber / 1000000000);
    
    if (phanDu > 0) {
      const phanDoc = docHangTrieu(phanDu, tempNumber > 0);
      // Thêm dấu phẩy nếu đã có phần phía sau (str không rỗng)
      str = phanDoc + suffix + (str ? ', ' : '') + str;
    }
    
    i++;
    suffix = ' tỷ';
  }

  str = str.trim();
  if (str.length > 0) {
      str = str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  return str + ' đồng';
}