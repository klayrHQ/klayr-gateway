import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { GITHUB_BASE_URL } from 'src/config/constants';

@Injectable()
export class GithubService {
  private readonly baseUrl = GITHUB_BASE_URL;

  async getRepoContents(klayrEnv: string, branch: string = 'main'): Promise<any> {
    const url = `${this.baseUrl}/${klayrEnv}?ref=${branch}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
    }
    return response.json();
  }

  async getFileContents(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file contents: ${response.statusText}`);
    }
    return response.json();
  }
}
