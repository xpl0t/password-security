import { Component, OnInit } from '@angular/core';
import { PasswordInfo, PasswordInfoType } from './password-info';
import * as topPasswords from './top10000.json';
import { HttpClient } from '@angular/common/http';
import { EntropyInfos } from './entropy-info';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  public curPassword = '';
  public hidePassword = true;

  public statisticTimeout = -1;

  public showSafetyInfo = false;

  public entropyInfos = new EntropyInfos(0, 0, 0);

  public saftyPercentage = 50;

  public safetyInfos: PasswordInfo[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  onPasswordUpdate(password: string) {
    if (password.length > 0) {
      this.entropyInfos = this.getEntropyInfos(password);
      this.saftyPercentage = this.getSafetyPercentage(this.entropyInfos.entropy);
    }
    this.updatePasswordInfos(password);
  }

  updatePasswordInfos(password: string) {
    this.curPassword = password;
    this.safetyInfos = [];

    if (this.statisticTimeout !== -1) {
      clearTimeout(this.statisticTimeout);
    }

    this.showSafetyInfo = (password.length > 0) ? true : false;
    if (this.showSafetyInfo === false) { return; }

    // Searching in top passwords
    if (password.length < 50) {
      const passwordIdx = this.findIndex(topPasswords['default'], password);
      if (passwordIdx !== -1) {
        this.safetyInfos.push(new PasswordInfo(
          PasswordInfoType.Critical, 'Dieses Passwort ist die Nummer ' + (passwordIdx + 1).toString() + ' der meist genutzten Passwörtern!', 'Dein Passwort wird sehr oft genutzt! Dies führt dazu, dass es in wenigen Sekunden geknackt werden kann!'));
      }
    }

    // Checking length
    if (password.match('^.{1,6}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Länge: Sehr kurz', 'Überlege dir, Passwörter mit über 9 Zeichen zu verwenden'));
    }
    if (password.match('^.{7,9}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Länge: kurz', 'Überlege dir, Passwörter mit über 9 Zeichen zu verwenden'));
    }
    if (password.match('^.{15,}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Achievement, 'Länge: Sehr lang', 'Gut gemacht! Umso länger umso besser!'));
    }

    // Guesses

    if (password.match('^[a-zA-Z]{1,16}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Möglicherweiße ein Wort', 'Dein Passwort ist Möglicherweise ein Wort oder ein Name. Wenn es in Verbindung mit deiner Person steht könnte es sehr leicht erraten werden. Wenn es ein Wort aus einer Sprache ist kann es auch sehr schnell geknackt werden.'));
    }
    if (password.match('^([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Möglicherweiße ein Wort mit einer Zahl', 'Dein Passwort ist Möglicherweise ein Wort mit einer Zahl. Dies ist eine sehr häufig genutzte Kombination und kann sehr schnell geknackt werden.'));
    }

    if (password.match('^[\\-\\(\\)\\.\\/\\s0-9]+$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Möglicherweiße eine Telefonummer / Datum', 'Dein Passwort ist Möglicherweise eine Telefonummer oder ein Datum. Wenn es dass ist und es in Verbindung mit dir steht könnte es sehr leicht erraten werden.'));
    }

    // character variety

    if (password.match('^[0-9]+$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Info, 'Zeichen Variation: nur Zahlen', 'Dein Passwort besteht ausschließlich aus Zahlen. Dies senkt die Anzahl der möglichen Kombinationen erheblich!'));
    }
    if (password.match('^[A-Za-z]+$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Info, 'Zeichen Variation: nur Buchstaben', 'Dein Passwort besteht ausschließlich aus Buchstaben. Sie können die Sicherheit erhöhen wenn sie Zahlen und Sonderzeichen hinzufügen.'));
    }
    if (password.match('^(?:\\d+[a-zA-Z]|[a-zA-Z]+\\d)[a-zA-Z\\d]*$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Info, 'Zeichen Variation: keine Sonderzeichen', 'Dein Passwort besteht nur aus Buchstaben und Zahlen. Mit Sonderzeichen kannst du die Sicherheit deines Passworts verbessern. Nicht vergessen: Du kannst of Leerzeichen in deinem Passwort verwenden.'));
    }


    if (password.match('(.+)\\1{2,}')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Wiederholtes Muster', 'Wiederholte Muster können dein Passwort mehr vorhersehbar machen'));
    }

    // Achievements / eastereggs

    if (password === 'correcthorsebatterystaple') {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Achievement, 'xkcd', 'Dieses Passwort dürfte mittlerweile auch den Crackern bekannt sein ;)'));
    }
    if (password.match('[^A-Za-z0-9\\u0000-\\u007E]')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Achievement, 'Unicode', 'Dein Passwort enthält Zeichen die nicht auf der Tastatur sind. Dies sollte es wesentlich sicherer machen, da dadurch der Zeichensatz erheblich größer ist.'));
    }
    if (password.match('^xpl0t|calendario|millionare|billionare$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Easteregg, 'calendario', 'The real g and developer of calendario. Lives the great live in new Zealand...'));
    }

    this.safetyInfos.sort((a, b) => (a.type > b.type) ? -1 : (a.type < b.type) ? 1 : 0);
  }

  private findIndex(list: string[], item: string): number {
    item = item.toUpperCase();
    for (let i = 0; i < list.length; i++) {
      if (list[i].toUpperCase() === item) {
        return i;
      }
    }
    return -1;
  }

  private getEntropyInfos(password: string): EntropyInfos {
    let pool = 0;

    pool += (password.match(/[a-z]/g)) ? 26 : 0;
    pool += (password.match(/[A-Z]/g)) ? 26 : 0;
    pool += (password.match(/[0-9]/g)) ? 10 : 0;
    pool += (password.match(/[\x3a-\x40]|[\x20-\x2f]|[\x5b-\x60]|[\x7b-\x7e]/g)) ? 33 : 0;

    const entropy = Math.log2(pool) * password.length;

    console.log('Pool of characters: ' + pool);
    console.log('Entropy: ' + entropy);

    return new EntropyInfos(pool, entropy, pool * password.length);
  }

  private getSafetyPercentage(entropy: number): number {
    return entropy * 100 / 124;
  }
}
