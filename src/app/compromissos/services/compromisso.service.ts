import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, shareReplay, throwError } from "rxjs";
import { LocalStorageService } from "src/app/auth/services/local-storage.service";
import { environment } from "src/environments/environment";
import { FormsCompromissoViewModel } from "../view-models/forms-compromisso.view-model";
import { ListarCompromissoViewModel } from "../view-models/listar-compromisso.view-model";
import { VisualizarCompromissoViewModel } from "../view-models/visualizar-compromisso.view-model";

@Injectable()
export class CompromissoService {
  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  public inserir(compromisso: FormsCompromissoViewModel): Observable<FormsCompromissoViewModel> {
    const resposta = this.http
      .post<FormsCompromissoViewModel>(this.apiUrl + 'compromissos', compromisso, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public editar(compromisso: FormsCompromissoViewModel): Observable<FormsCompromissoViewModel> {
    const resposta = this.http
      .put<FormsCompromissoViewModel>(this.apiUrl + 'compromissos/' + compromisso.id, compromisso, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public excluir(id: string): Observable<string> {
    const resposta = this.http
      .delete<string>(this.apiUrl + 'compromissos/' + id, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarTodos(): Observable<ListarCompromissoViewModel[]> {
    const resposta = this.http
      .get<ListarCompromissoViewModel[]>(this.apiUrl + 'compromissos', this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), shareReplay(), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarCompromissosDeHoje(): Observable<ListarCompromissoViewModel[]> {
    const data = new Date().toISOString().substring(0, 10);

    const resposta = this.http
      .get<ListarCompromissoViewModel[]>(this.apiUrl + `compromissos/hoje/${data}`, this.obterHeadersAutorizacao())
      .pipe(
        map(this.processarDados),
        map(this.ordenarCompromissosPorDataRecente),
        shareReplay(),
        catchError(this.processarFalha)
      );

    return resposta;
  }

  public selecionarCompromissosFuturos(periodoDias: number = 7): Observable<ListarCompromissoViewModel[]> {
    const dataHoje = new Date().toISOString().substring(0, 10);
    const dataFuturo = new Date(new Date().setDate(new Date().getDate() + periodoDias));

    const dataFuturoProcessada = dataFuturo.toISOString().substring(0, 10);

    const resposta = this.http
      .get<ListarCompromissoViewModel[]>(this.apiUrl + `compromissos/futuros/${dataHoje}=${dataFuturoProcessada}`, this.obterHeadersAutorizacao())
      .pipe(
        map(this.processarDados),
        map(this.ordenarCompromissosPorDataRecente),
        shareReplay(),
        catchError(this.processarFalha)
      );

    return resposta;
  }

  public selecionarCompromissosPassados(): Observable<ListarCompromissoViewModel[]> {
    const dataHoje = new Date().toISOString().substring(0, 10);

    const resposta = this.http
      .get<ListarCompromissoViewModel[]>(this.apiUrl + `compromissos/passados/${dataHoje}`, this.obterHeadersAutorizacao())
      .pipe(
        map(this.processarDados),
        map(this.ordenarCompromissosPorDataRecente),
        shareReplay(),
        catchError(this.processarFalha)
      );

    return resposta;
  }

  public selecionarPorId(id: string): Observable<FormsCompromissoViewModel> {
    const resposta = this.http
      .get<FormsCompromissoViewModel>(this.apiUrl + 'compromissos/' + id, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarCompromissoCompletoPorId(id: string): Observable<VisualizarCompromissoViewModel> {
    const resposta = this.http
      .get<VisualizarCompromissoViewModel>(this.apiUrl + 'compromissos/visualizacao-completa/' + id, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  private obterHeadersAutorizacao() {
    const token = this.localStorageService.obterTokenUsuario();

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    }
  }

  private processarDados(resposta: any) {
    if (resposta?.sucesso)
      return resposta.dados;
    else
      return resposta;
  }

  private processarFalha(resposta: any) {
    return throwError(() => new Error(resposta.error.erros[0]));
  }

  private ordenarCompromissosPorDataRecente(compromissos: ListarCompromissoViewModel[]) {
    return compromissos.sort((a, b) => {
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });
  }
}
