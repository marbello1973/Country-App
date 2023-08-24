import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, tap } from 'rxjs';
import { Country } from '../interfaces/country';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private apiUrl: string = 'https://restcountries.com/v3.1';

  // private regionUrl: string = 'https://restcountries.com/v3.1/region/';

  public cacheStore: CacheStore = {
    byCapítal: { term: '', countries: [] },
    byCountries: { term: '', countries: [] },
    byRegion: { region: '', countries: [] },
  };

  constructor(private http: HttpClient) {
    this.loadFromLOcalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('cacheStore', JSON.stringify(this.cacheStore));
  }

  private loadFromLOcalStorage() {
    if (!localStorage.getItem('cacheStore')) return;
    this.cacheStore = JSON.parse(localStorage.getItem('cacheStore')!);
  }

  private getContriesRequest(url: string): Observable<Country[]> {
    return this.http.get<Country[]>(url).pipe(
      catchError(() => of([]))
      // delay(2000)
    );
  }

  searchCountryByAlphaCode(code: string): Observable<Country | null> {
    const url = `${this.apiUrl}/alpha/${code}`;

    return this.http.get<Country[]>(url).pipe(
      map((countries) => (countries.length > 0 ? countries[0] : null)),
      catchError(() => of(null))
    );
  }

  searchCapital(term: string): Observable<Country[]> {
    const url = `${this.apiUrl}/capital/${term}`;
    return this.getContriesRequest(url).pipe(
      tap((countries) => (this.cacheStore.byCapítal = { term, countries })),
      tap(() => this.saveToLocalStorage())
    );
  }

  searchCountry(term: string): Observable<Country[]> {
    const url = `${this.apiUrl}/name/${term}`;
    return this.getContriesRequest(url).pipe(
      tap((countries) => (this.cacheStore.byCountries = { term, countries })),
      tap(() => this.saveToLocalStorage())
    );
  }

  searchRegion(region: Region): Observable<Country[]> {
    const url = `${this.apiUrl}/region/${region}`;
    return this.getContriesRequest(url).pipe(
      tap((countries) => (this.cacheStore.byRegion = { region, countries })),
      tap(() => this.saveToLocalStorage())
    );
  }
}
