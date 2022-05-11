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
          PasswordInfoType.Critical, 'This password is the number ' + (passwordIdx + 1).toString() + ' of the most used passwords!', 'Your password is used very often! This password can be cracked by wordlist attacks in a very short time!'));
      }
    }

    // Checking length
    if (password.match('^.{1,6}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Length: very short', 'Better use passwords with 9 characters or more'));
    }
    if (password.match('^.{7,9}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Length: short', 'Better use passwords with 9 characters or more'));
    }
    if (password.match('^.{15,}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Achievement, 'Length: very long', 'Well done 😎 The longer the password the stronger it is!'));
    }

    // Guesses

    if (password.match('^[a-zA-Z]{1,16}$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Possibly a word', 'Your password is possibly a word or name. If it is related to a person, pet or something else it could be easily guessed. If it is a word of some language it can be easily cracked too.'));
    }
    if (password.match('^([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Possibly a word with a number', 'Your password is possibly a word with number. This is a common combination, which can be cracked pretty fast.'));
    }

    if (password.match('^[\\-\\(\\)\\.\\/\\s0-9]+$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Possibly a telephone number / date', 'Your password is possibly a date or a telephone number. If it is related to you in someway it could be easily guessed, for example your birthday.'));
    }

    // character variety

    if (password.match('^[0-9]+$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Info, 'Charset: only digits', 'Your password consits of digits exclusively. This shrinks the count of possible combinations dramatically!'));
    }
    if (password.match('^[A-Za-z]+$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Info, 'Charset: only of letters', 'Your password consits of letters exclusively. You can enhance the password by adding digits and special characters.'));
    }
    if (password.match('^(?:\\d+[a-zA-Z]|[a-zA-Z]+\\d)[a-zA-Z\\d]*$')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Info, 'Charset: no special characters', 'Your password consits only of letters and digits. You can enhance the security of your password easily by adding them to your password.'));
    }


    if (password.match('(.+)\\1{2,}')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Warning, 'Repeating pattern', 'Repeating patterns can make your password more predictable.'));
    }

    // Achievements / eastereggs

    if (password === 'correcthorsebatterystaple') {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Achievement, 'xkcd', 'Come on, you know whats up 😎'));
    }
    if (password.match('[^A-Za-z0-9\\u0000-\\u007E]')) {
      this.safetyInfos.push(new PasswordInfo(
        PasswordInfoType.Achievement, 'Unicode', 'Your password contains unicode characters, which increases the size of the charset very much, which is very good 😉'));
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

    return new EntropyInfos(pool, entropy, Math.pow(pool, password.length));
  }

  private getSafetyPercentage(entropy: number): number {
    return entropy * 100 / 124;
  }
}
