import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError, throwError, shareReplay } from "rxjs";
import { LocalStorageService } from "src/app/auth/services/local-storage.service";
import { environment } from "src/environments/environment";
import { FormsContatoViewModel } from "../view-models/forms-contato.view-model";
import { ListarContatoViewModel } from "../view-models/listar-contato.view-model";
import { VisualizarContatoViewModel } from "../view-models/visualizar-contato.view-model";

@Injectable()
export class ContatoService {
  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  public inserir(contato: FormsContatoViewModel): Observable<FormsContatoViewModel> {
    const resposta = this.http
      .post<FormsContatoViewModel>(this.apiUrl + 'contatos', contato, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public editar(contato: FormsContatoViewModel): Observable<FormsContatoViewModel> {
    const resposta = this.http
      .put<FormsContatoViewModel>(this.apiUrl + 'contatos/' + contato.id, contato, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public excluir(id: string): Observable<string> {
    const resposta = this.http
      .delete<string>(this.apiUrl + 'contatos/' + id, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarTodos(): Observable<ListarContatoViewModel[]> {
    const resposta = this.http
      .get<ListarContatoViewModel[]>(this.apiUrl + 'contatos', this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), shareReplay(), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarContatosFavoritos(): Observable<ListarContatoViewModel[]> {
    const resposta = this.http
      .get<ListarContatoViewModel[]>(this.apiUrl + 'contatos?statusFavorito=1', this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), shareReplay(), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarContatosComuns(): Observable<ListarContatoViewModel[]> {
    const resposta = this.http
      .get<ListarContatoViewModel[]>(this.apiUrl + 'contatos?statusFavorito=2', this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), shareReplay(), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarPorId(id: string): Observable<FormsContatoViewModel> {
    const resposta = this.http
      .get<FormsContatoViewModel>(this.apiUrl + 'contatos/' + id, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public selecionarContatoCompletoPorId(id: string): Observable<VisualizarContatoViewModel> {
    const resposta = this.http
      .get<VisualizarContatoViewModel>(this.apiUrl + 'contatos/visualizacao-completa/' + id, this.obterHeadersAutorizacao())
      .pipe(map(this.processarDados), catchError(this.processarFalha));

    return resposta;
  }

  public ativarStatusFavorito(contatoId: string): Observable<FormsContatoViewModel> {
    const resposta = this.http
      .put<FormsContatoViewModel>(
        this.apiUrl + 'contatos/favoritos/' + contatoId,
        null,
        this.obterHeadersAutorizacao()
      )
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
}
