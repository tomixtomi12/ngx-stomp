
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";


export class WebsocketRx {

  private socket : WebSocket;
  private socketChannel : Observable<MessageEvent>;


  constructor(url : string){
    this.connect(url);
  }

  public get messages() : Observable<MessageEvent>{
    return this.socketChannel;
  }

  public send(data : any){
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  public close(){
    this.socket.close();
  }

  private connect(url : string) {
    if(!this.socketChannel) {
      this.socket = new WebSocket(url);
      this.socketChannel = this.create(this.socket);
    }
  }

  private create(ws : WebSocket): Subject<MessageEvent> {
    return Observable.create(
      (obs: Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      }
    );
  }
}
