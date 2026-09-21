// ============================================================================
// TÉCNICAMZ PRO — SISTEMA DE BARRAMENTOS E TRILHOS DIN (IEC/EN 60715 & IEC 60364)
// Suporte a Trilhos DIN 35mm, Pentes de Ligação Trifásica L1/L2/L3, Neutro e Terra PE
// ============================================================================

export interface Busbar {
  id: string;
  type: 'din' | 'phase_l1' | 'phase_l2' | 'phase_l3' | 'neutral' | 'earth';
  x: number;
  y: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
}

export const DEFAULT_MOTOR_BUSBARS: Busbar[] = [
  { id: 'DIN_1', type: 'din', x: 0, y: -90, length: 860, orientation: 'horizontal' },
  { id: 'DIN_2', type: 'din', x: 0, y: 130, length: 860, orientation: 'horizontal' },
  { id: 'BB_N', type: 'neutral', x: 0, y: -180, length: 700, orientation: 'horizontal' },
  { id: 'BB_PE', type: 'earth', x: 0, y: 220, length: 700, orientation: 'horizontal' }
];

export const DEFAULT_QGD_BUSBARS: Busbar[] = [
  { id: 'DIN_1', type: 'din', x: 0, y: -50, length: 760, orientation: 'horizontal' },
  { id: 'BB_N', type: 'neutral', x: 0, y: -150, length: 600, orientation: 'horizontal' },
  { id: 'BB_PE', type: 'earth', x: 0, y: 170, length: 600, orientation: 'horizontal' }
];

export const DEFAULT_FOURWAY_BUSBARS: Busbar[] = [
  { id: 'DIN_1', type: 'din', x: 0, y: 0, length: 760, orientation: 'horizontal' },
  { id: 'BB_N', type: 'neutral', x: 0, y: 140, length: 600, orientation: 'horizontal' },
  { id: 'BB_PE', type: 'earth', x: 0, y: 210, length: 600, orientation: 'horizontal' }
];

/**
 * Snapping Magnético de Componentes aos Trilhos DIN e Barramentos:
 * Quando um componente é aproximado de um trilho, sua trava mecânica traseira
 * alinha-se perfeitamente com a linha de centro do trilho DIN (35mm).
 */
export function snapComponentToBusbars(
  comp: any,
  rawNx: number,
  rawNy: number,
  busbars: Busbar[],
  snapTolerance: number,
  allComponents?: any[]
): { nx: number; ny: number; x: number; y: number; snappedBusbarId?: string } {
  if (!busbars || busbars.length === 0) return { nx: rawNx, ny: rawNy, x: rawNx, y: rawNy };

  const compW = comp?.w || 90;
  const compH = comp?.h || 80;

  for (const bb of busbars) {
    if (bb.orientation === 'horizontal') {
      const halfLen = bb.length / 2;
      const isWithinX = rawNx >= bb.x - halfLen - compW * 0.4 && rawNx <= bb.x + halfLen + compW * 0.4;

      if (isWithinX) {
        if (bb.type === 'din') {
          // Trava traseira do componente coincide exatamente com o centro do trilho DIN (y = bb.y)
          if (Math.abs(rawNy - bb.y) < snapTolerance) {
            return { nx: rawNx, ny: bb.y, x: rawNx, y: bb.y, snappedBusbarId: bb.id };
          }
        } else {
          // Barramentos de fase, neutro ou terra: alinha na linha dos bornes superiores ou inferiores
          const targetYTop = bb.y + compH / 2;
          const targetYBottom = bb.y - compH / 2;

          if (Math.abs(rawNy - targetYTop) < snapTolerance) {
            return { nx: rawNx, ny: targetYTop, x: rawNx, y: targetYTop, snappedBusbarId: bb.id };
          }
          if (Math.abs(rawNy - targetYBottom) < snapTolerance) {
            return { nx: rawNx, ny: targetYBottom, x: rawNx, y: targetYBottom, snappedBusbarId: bb.id };
          }
        }
      }
    } else {
      // Trilho ou Barramento Vertical
      const halfLen = bb.length / 2;
      const isWithinY = rawNy >= bb.y - halfLen - compH * 0.4 && rawNy <= bb.y + halfLen + compH * 0.4;

      if (isWithinY) {
        if (bb.type === 'din') {
          if (Math.abs(rawNx - bb.x) < snapTolerance) {
            return { nx: bb.x, ny: rawNy, x: bb.x, y: rawNy, snappedBusbarId: bb.id };
          }
        } else {
          const targetXRight = bb.x + compW / 2;
          const targetXLeft = bb.x - compW / 2;

          if (Math.abs(rawNx - targetXRight) < snapTolerance) {
            return { nx: targetXRight, ny: rawNy, x: targetXRight, y: rawNy, snappedBusbarId: bb.id };
          }
          if (Math.abs(rawNx - targetXLeft) < snapTolerance) {
            return { nx: targetXLeft, ny: rawNy, x: targetXLeft, y: rawNy, snappedBusbarId: bb.id };
          }
        }
      }
    }
  }

  return { nx: rawNx, ny: rawNy, x: rawNx, y: rawNy };
}

/**
 * Renderização Profissional de Trilhos DIN e Barramentos Elétricos no Canvas:
 * Padrão IEC/EN 60715 (35mm) em aço zincado com rebaixos, furos oblongos e brilho metálico suave,
 * e barramentos técnicos em cobre rígido isolado com códigos de cores normativos.
 */
export function drawBusbars(
  ctx: CanvasRenderingContext2D,
  cam: { zoom: number; pan: { x: number; y: number } },
  busbars: Busbar[],
  selectedBusbarId: string | null
): void {
  if (!busbars || busbars.length === 0) return;

  const toScreen = (p: { x: number; y: number }) => ({
    x: p.x * cam.zoom + cam.pan.x,
    y: p.y * cam.zoom + cam.pan.y
  });

  busbars.forEach((bb: Busbar) => {
    const isHorizontal = bb.orientation === 'horizontal';
    const isSelected = bb.id === selectedBusbarId;
    const len = bb.length * cam.zoom;
    const center = toScreen({ x: bb.x, y: bb.y });

    ctx.save();
    ctx.translate(center.x, center.y);
    if (!isHorizontal) {
      ctx.rotate(Math.PI / 2);
    }

    if (bb.type === 'din') {
      // ======================================================================
      // TRILHO DIN 35mm PADRÃO IEC/EN 60715 (TH35-7.5 / TH35-15)
      // ======================================================================
      const railH = 35 * cam.zoom;
      const rx = -len / 2;
      const ry = -railH / 2;

      // 1. Sombra projetada do trilho na chapa de montagem traseira do quadro
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 10 * cam.zoom;
      ctx.shadowOffsetY = 4 * cam.zoom;

      // 2. Gradiente Metálico de Aço Galvanizado / Zincado Eletrolítico
      const dinGrad = ctx.createLinearGradient(0, ry, 0, ry + railH);
      dinGrad.addColorStop(0, '#64748b');   // Aba de flange superior (luz)
      dinGrad.addColorStop(0.12, '#475569'); // Degrau superior
      dinGrad.addColorStop(0.22, '#1e293b'); // Canaleta rebaixada profunda (sombra)
      dinGrad.addColorStop(0.5, '#334155');  // Fundo central da calha
      dinGrad.addColorStop(0.78, '#1e293b'); // Canaleta rebaixada inferior
      dinGrad.addColorStop(0.88, '#475569'); // Degrau inferior
      dinGrad.addColorStop(1, '#64748b');   // Aba de flange inferior (luz)

      ctx.fillStyle = dinGrad;
      ctx.fillRect(rx, ry, len, railH);

      ctx.shadowColor = 'transparent';

      // 3. Bordas Metálicas de Alta Definição (Bisel / Chanfro)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
      // Linha superior
      ctx.beginPath();
      ctx.moveTo(rx, ry + 0.5);
      ctx.lineTo(rx + len, ry + 0.5);
      ctx.stroke();
      // Linha inferior
      ctx.beginPath();
      ctx.moveTo(rx, ry + railH - 0.5);
      ctx.lineTo(rx + len, ry + railH - 0.5);
      ctx.stroke();

      // 4. Linhas de dobra da canaleta de encaixe (27mm interno)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1, 1.5 * cam.zoom);
      ctx.beginPath();
      ctx.moveTo(rx, ry + railH * 0.22);
      ctx.lineTo(rx + len, ry + railH * 0.22);
      ctx.moveTo(rx, ry + railH * 0.78);
      ctx.lineTo(rx + len, ry + railH * 0.78);
      ctx.stroke();

      // 5. Furos Oblongos de Fixação Periódicos Padrão IEC (Slotted Holes)
      const slotPitch = 40 * cam.zoom;
      const slotW = 18 * cam.zoom;
      const slotH = 6 * cam.zoom;
      const numSlots = Math.floor(len / slotPitch);
      const startSlotX = -((numSlots - 1) * slotPitch) / 2;

      ctx.fillStyle = '#050a14'; // Abertura na chapa de fundo
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = Math.max(0.7, 0.9 * cam.zoom);

      for (let i = 0; i < numSlots; i++) {
        const sx = startSlotX + i * slotPitch;
        ctx.beginPath();
        ctx.roundRect(sx - slotW / 2, -slotH / 2, slotW, slotH, slotH / 2);
        ctx.fill();
        ctx.stroke();

        // Parafuso de fixação no painel a cada 3 furos (Cabeça Pan M4)
        if (i % 3 === 1) {
          ctx.save();
          // Cabeça do parafuso
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(sx, 0, slotH * 0.62, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = Math.max(0.6, 0.8 * cam.zoom);
          ctx.stroke();
          // Fenda Philips/Cruz do parafuso
          ctx.strokeStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(sx - 2 * cam.zoom, 0);
          ctx.lineTo(sx + 2 * cam.zoom, 0);
          ctx.moveTo(sx, -2 * cam.zoom);
          ctx.lineTo(sx, 2 * cam.zoom);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 6. Gravação Técnica Normativa Imprimida em Baixo-Relevo
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.font = `bold ${Math.max(6, 7.5 * cam.zoom)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('IEC/EN 60715 • TH35-7.5', rx + 14 * cam.zoom, ry + railH * 0.17);

      // 7. Postes de Travamento Lateral / Fim de Curso (End Stops DIN)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
      // Poste esquerdo
      ctx.beginPath();
      ctx.roundRect(rx - 7 * cam.zoom, ry - 3 * cam.zoom, 9 * cam.zoom, railH + 6 * cam.zoom, 2 * cam.zoom);
      ctx.fill();
      ctx.stroke();
      // Poste direito
      ctx.beginPath();
      ctx.roundRect(rx + len - 2 * cam.zoom, ry - 3 * cam.zoom, 9 * cam.zoom, railH + 6 * cam.zoom, 2 * cam.zoom);
      ctx.fill();
      ctx.stroke();

    } else {
      // ======================================================================
      // BARRAMENTOS ELÉTRICOS DE COBRE / PENTES TÉCNICOS (BUSBARS)
      // ======================================================================
      const bbH = 14 * cam.zoom;
      const rx = -len / 2;
      const ry = -bbH / 2;

      let baseColor = '#991b1b';
      let strokeColor = '#ef4444';
      let labelText = 'L1 • FASE 1 (400V / 63A)';
      let isStripedEarth = false;

      switch (bb.type) {
        case 'phase_l1':
          baseColor = '#991b1b'; // Vermelho / Castanho IEC
          strokeColor = '#ef4444';
          labelText = 'L1 • FASE 1 (400V / 63A IEC)';
          break;
        case 'phase_l2':
          baseColor = '#0f172a'; // Preto / Dark Slate
          strokeColor = '#3b82f6';
          labelText = 'L2 • FASE 2 (400V / 63A IEC)';
          break;
        case 'phase_l3':
          baseColor = '#78350f'; // Âmbar / Cinza
          strokeColor = '#d97706';
          labelText = 'L3 • FASE 3 (400V / 63A IEC)';
          break;
        case 'neutral':
          baseColor = '#0369a1'; // Azul Celeste
          strokeColor = '#0ea5e9';
          labelText = 'N • BARRAMENTO NEUTRO (63A IEC)';
          break;
        case 'earth':
          baseColor = '#15803d'; // Verde-Amarelo
          strokeColor = '#22c55e';
          labelText = 'PE • BARRAMENTO DE PROTEÇÃO / TERRA (IEC 60364)';
          isStripedEarth = true;
          break;
      }

      // Sombra
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8 * cam.zoom;
      ctx.shadowOffsetY = 2.5 * cam.zoom;

      // Corpo da Barra Isolante com Núcleo de Cobre
      ctx.fillStyle = baseColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(1.2, 1.8 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(rx, ry, len, bbH, 3 * cam.zoom);
      ctx.fill();
      ctx.stroke();

      // Listras diagonais de alta visibilidade no barramento de terra PE
      if (isStripedEarth) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(rx, ry, len, bbH, 3 * cam.zoom);
        ctx.clip();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4 * cam.zoom;
        const stripePitch = 16 * cam.zoom;
        for (let sx = rx - bbH * 2; sx < rx + len + bbH * 2; sx += stripePitch) {
          ctx.beginPath();
          ctx.moveTo(sx, ry);
          ctx.lineTo(sx + bbH, ry + bbH);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.shadowColor = 'transparent';

      // Bornes de Parafuso / Dentes de Conexão em Latão Dourado
      const screwPitch = 24 * cam.zoom;
      const numScrews = Math.floor(len / screwPitch);
      const startScrewX = -((numScrews - 1) * screwPitch) / 2;

      for (let i = 0; i < numScrews; i++) {
        const sx = startScrewX + i * screwPitch;

        // Terminal circular em latão
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(sx, 0, 3.5 * cam.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = Math.max(0.8, 1 * cam.zoom);
        ctx.stroke();

        // Fenda de aperto do parafuso
        ctx.strokeStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(sx - 1.5 * cam.zoom, 0);
        ctx.lineTo(sx + 1.5 * cam.zoom, 0);
        ctx.stroke();
      }

      // Rótulo Técnico de Identificação
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(7, 8.5 * cam.zoom)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(labelText, rx + 10 * cam.zoom, ry - 5 * cam.zoom);

      // Terminal Principal de Alimentação (Cabo de Entrada / Lug de Cobre)
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = Math.max(1, 1.2 * cam.zoom);
      ctx.beginPath();
      ctx.roundRect(rx - 8 * cam.zoom, ry - 3 * cam.zoom, 10 * cam.zoom, bbH + 6 * cam.zoom, 2 * cam.zoom);
      ctx.fill();
      ctx.stroke();
    }

    // Se selecionado: Moldura de destaque com alças de redimensionamento
    if (isSelected) {
      const pad = 4 * cam.zoom;
      const selW = len + pad * 2;
      const selH = (bb.type === 'din' ? 35 : 14) * cam.zoom + pad * 2;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(1.5, 2 * cam.zoom);
      ctx.setLineDash([4 * cam.zoom, 4 * cam.zoom]);
      ctx.strokeRect(-selW / 2, -selH / 2, selW, selH);
      ctx.setLineDash([]);

      // Alças de pegada/redimensionamento
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-len / 2, 0, 5 * cam.zoom, 0, Math.PI * 2);
      ctx.arc(len / 2, 0, 5 * cam.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * cam.zoom;
      ctx.stroke();
    }

    ctx.restore();
  });
}
