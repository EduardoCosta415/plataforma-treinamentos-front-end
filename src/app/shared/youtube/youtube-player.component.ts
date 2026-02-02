import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

type VideoProgressEvent = { currentTime: number; duration: number };

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
})
export class YoutubePlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() videoId: string | null = null;

  @Input() blockSeek = true;

  /** tempo máximo permitido (vem do backend) */
  @Input() allowedTime = 0;

  /** tolerância para não ficar “brigando” com o player */
  @Input() seekToleranceSeconds = 2;

  @Output() progress = new EventEmitter<VideoProgressEvent>();
  @Output() ended = new EventEmitter<void>();

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private player: any = null;
  private progressTimer: any = null;

  private isReady = false;

  // ✅ Resume: aplicar só uma vez por vídeo
  private resumeAppliedForVideoId: string | null = null;

  // ✅ Guardas anti-loop
  private lastSecondEmitted = -1;
  private lastKnownTime = 0;

  // ✅ quando estamos forçando um seek (para não reagir em cascata)
  private internalSeeking = false;

  ngAfterViewInit(): void {
    this.ensureYoutubeApi().then(() => {
      if (this.videoId) this.createPlayer(this.videoId);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Troca de vídeo
    if (changes['videoId'] && !changes['videoId'].firstChange) {
      const id = changes['videoId'].currentValue as string | null;
      if (!id) return;

      this.resumeAppliedForVideoId = null;
      this.lastSecondEmitted = -1;
      this.lastKnownTime = 0;

      if (this.player?.loadVideoById) {
        this.player.loadVideoById(id);
      } else {
        this.ensureYoutubeApi().then(() => this.createPlayer(id));
      }
    }

    /**
     * ✅ IMPORTANTÍSSIMO:
     * NÃO dar seek automaticamente quando allowedTime muda.
     * allowedTime serve só para limitar pulo (blockSeek).
     */
  }

  ngOnDestroy(): void {
    if (this.progressTimer) clearInterval(this.progressTimer);
    this.progressTimer = null;

    try {
      this.player?.destroy?.();
    } catch {}
    this.player = null;
  }

  private createPlayer(videoId: string): void {
    this.host.nativeElement.innerHTML = '';
    this.isReady = false;
    this.resumeAppliedForVideoId = null;

    this.player = new window.YT.Player(this.host.nativeElement, {
      videoId,
      width: '100%',
      height: '420',
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          this.isReady = true;

          // ✅ aplica resume uma única vez
          this.applyInitialResumeOnce();

          // ✅ começa loop de progress
          this.startProgressLoop();
        },
        onStateChange: (e: any) => {
          // 0 = ended
          if (e?.data === 0) this.ended.emit();
        },
      },
    });
  }

  private startProgressLoop(): void {
    if (this.progressTimer) clearInterval(this.progressTimer);

    this.progressTimer = setInterval(() => {
      if (!this.player?.getCurrentTime) return;

      const currentTime = Number(this.player.getCurrentTime?.() || 0);
      const duration = Number(this.player.getDuration?.() || 0);

      // evita spam (emite só quando muda o segundo)
      const sec = Math.floor(currentTime);
      if (sec !== this.lastSecondEmitted) {
        this.lastSecondEmitted = sec;
        this.progress.emit({ currentTime, duration });
      }

      // ✅ aplica regra anti-pulo somente se detectar salto real
      this.enforceSeekRule(currentTime);

      this.lastKnownTime = currentTime;
    }, 1000);
  }

  /**
   * ✅ Anti-pulo seguro:
   * - só “puxa para trás” quando o usuário SALTA pra frente (diferença grande)
   * - NÃO depende de allowedTime acompanhar em tempo real
   */
  private enforceSeekRule(currentTime: number): void {
    if (!this.blockSeek) return;
    if (!this.isReady) return;
    if (!this.player?.seekTo) return;
    if (this.internalSeeking) return;

    const allowed = Math.floor(this.allowedTime || 0);
    const limit = allowed + Math.max(0, this.seekToleranceSeconds);

    const cur = Math.floor(currentTime);
    const prev = Math.floor(this.lastKnownTime);

    // se o player andou normal (0~1s), não faz nada
    const jumpedForward = cur - prev >= 3; // salto perceptível (seek manual)
    if (!jumpedForward) return;

    // se pulou além do limite permitido, volta pro allowed
    if (cur > limit) {
      try {
        this.internalSeeking = true;
        this.player.seekTo(allowed, true);
      } catch {
      } finally {
        // libera após um pequeno delay pra evitar loops
        setTimeout(() => (this.internalSeeking = false), 300);
      }
    }
  }

  /**
   * ✅ Resume 1 vez:
   * - usa allowedTime como “lastPosition”
   * - aplica somente quando o player fica pronto e somente uma vez por videoId
   */
  private applyInitialResumeOnce(): void {
    if (!this.isReady) return;
    if (!this.player?.seekTo) return;

    const vid = this.videoId || null;
    if (!vid) return;

    // já aplicado para este vídeo
    if (this.resumeAppliedForVideoId === vid) return;

    const resumeAt = Math.floor(this.allowedTime || 0);

    // só retoma se tiver tempo significativo
    if (resumeAt > 1) {
      try {
        this.internalSeeking = true;
        this.player.seekTo(resumeAt, true);
      } catch {
      } finally {
        setTimeout(() => (this.internalSeeking = false), 300);
      }

      // atualiza lastKnownTime pra não interpretar como "pulo"
      this.lastKnownTime = resumeAt;
      this.lastSecondEmitted = resumeAt;
    }

    this.resumeAppliedForVideoId = vid;
  }

  private ensureYoutubeApi(): Promise<void> {
    if (window.YT && window.YT.Player) return Promise.resolve();

    return new Promise((resolve) => {
      const existing = document.getElementById('youtube-iframe-api');
      if (existing) {
        const check = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(check);
            resolve();
          }
        }, 50);
        return;
      }

      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => resolve();
    });
  }
}
