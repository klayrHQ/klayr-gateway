import { Injectable } from '@nestjs/common';

@Injectable()
export class StateService {
  private state: Record<string, any> = {};

  get(key: string): any {
    return this.state[key];
  }

  set(key: string, value: any): void {
    this.state[key] = value;
  }

  getAllState(): Record<string, any> {
    return this.state;
  }
}
