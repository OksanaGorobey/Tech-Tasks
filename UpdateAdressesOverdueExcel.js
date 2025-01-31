class UpdateAdressesOverdue {
  constructor() {
    //встановлюємо данні для обчислення
    this.today = new Date();
    this.diffRound = (1000 * 60 * 60 * 24);
    this.overdueDays = 120;

    //ініціюємо змінні для даних з таблиці
    this.data = [];
    this.sheet = {};
    this.headers = [];

    //встановлюємо дані з таблиці
    this._initiationSheet();

    //ініціюємо дати та колинки в які встановити що вони прострочені
    this.lastTaken = '';
    this.lastPassen = '';
    this.lastTakenCol = 0;
  }

  _initiationSheet() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    this.data = this.sheet.getDataRange().getValues();

    //беремо одразу другу строку заголовків
    this.headers = this.data[1];

    // очищуємо сторінку від попередніх значень
    this.sheet.getRange("A3:Z500").setBackground(null);
  }

  highlightOverdue() {
    if(this.data.length < 1 ){
      return;
    }

    for (let row = 2; row < this.data.length; row++) {
      let line = this.data[row];

      //очищуємо попередні данні
      this.lastTaken = '';
      this.lastPassen = '';
      this.lastTakenCol = 0;

      //встановлюємо усім строчкам де є 'Консьерж' світло жовтий колір
      this.setBackgroundConcierge(row, line);

      //ініціюємо останні змінні для останніх встановлених дат
      this.setLastDates(line);

      //перевіряємо чи є "просрочка" по датам і якщо так змінюємо колір потрібній строчці чи ячейці
      if (!this.isOverdueLastDates(row)) {
          continue;
      }
    }
  }

  setBackgroundConcierge(row, line) {
    if(line.includes('Консьерж')) {
      this.sheet.getRange(row + 1, 1, 1, this.headers.length).setBackground("lightgoldenrodyellow");
    }
  }

  setLastDates(line) {
    for (let headerCol = 0; headerCol < this.headers.length; headerCol++) {
      if (this.headers[headerCol] == '') {
        continue;
      }

      let headerName = this.headers[headerCol],
        currentData = line[headerCol];

      if (headerName == 'Взят' && currentData != '') {
          this.lastTaken = new Date(currentData);
          this.lastTakenCol = headerCol;
      } else if (headerName == 'Сдан' && (currentData != '' || line[headerCol - 1] != '')) {
          this.lastPassen = currentData != '' ? new Date(currentData) : currentData;
      }
    }      
  }

  isOverdueLastDates(row) {
    if (this.lastTaken == '' && this.lastPassen == '') {
      return false;
    }

    if (this.lastPassen != '') {
      let diffDays = ((this.today - this.lastPassen) / this.diffRound);

      if ((this.lastTaken == '' || this.lastPassen > this.lastTaken) && (diffDays > this.overdueDays)) { 
        this.sheet.getRange(row + 1, 1, 1, this.headers.length).setBackground("yellowgreen");
      }
    } else {

      let diffDays = ((this.today - this.lastTaken) / this.diffRound);

      if (this.lastTaken != '' && (diffDays > this.overdueDays)) {
        this.sheet.getRange(row + 1, this.lastTakenCol + 2).setBackground("crimson");
      }
    }

    return true;
  }

}





