import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Target,
  IncidentType,
  DecisionTree,
  StrapiList,
  StrapiSingle,
} from '../models/faq.models';

@Injectable({ providedIn: 'root' })
export class StrapiService {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = 'http://localhost:1337/api';

  // ── Récupérer tous les Targets ──────────────────────────────────────────
  getTargets(): Observable<Target[]> {
    return this.http
      .get<StrapiList<Target>>(`${this.apiUrl}/targets?sort=name:asc`)
      .pipe(map((res) => res.data));
  }

  // ── Récupérer les IncidentTypes d'un Target ─────────────────────────────
  getIncidentTypes(targetDocumentId: string): Observable<IncidentType[]> {
    const params = `filters[target][documentId][$eq]=${targetDocumentId}&sort=name:asc`;
    return this.http
      .get<StrapiList<IncidentType>>(`${this.apiUrl}/incident-types?${params}`)
      .pipe(map((res) => res.data));
  }

  // ── Récupérer l'arbre publié d'un IncidentType ──────────────────────────
  getPublishedTree(incidentTypeDocumentId: string): Observable<DecisionTree> {
    const params = [
      `filters[incident_type][documentId][$eq]=${incidentTypeDocumentId}`,
      `status=published`,
      `populate=*`,
      `sort=version:desc`,
      `pagination[pageSize]=1`,
    ].join('&');

    return this.http
      .get<StrapiList<DecisionTree>>(`${this.apiUrl}/decision-trees?${params}`)
      .pipe(
        map((res) => {
          if (!res.data || res.data.length === 0) {
            throw new Error('Aucun arbre publié trouvé pour cet incident.');
          }
          return res.data[0];
        }),
      );
  }

  // ── Récupérer un arbre par son documentId ───────────────────────────────
  getTreeById(documentId: string): Observable<DecisionTree> {
    return this.http
      .get<StrapiSingle<DecisionTree>>(
        `${this.apiUrl}/decision-trees/${documentId}?populate=*`,
      )
      .pipe(map((res) => res.data));
  }
}
