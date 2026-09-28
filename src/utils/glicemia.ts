import type { AnaliseGlicemia } from '@/types';

export function analisarGlicemia(valor: number): AnaliseGlicemia {
  if (valor < 70) {
    return {
      categoria: 'baixa',
      titulo: 'Alerta de Hipoglicemia',
      cor: 'amber',
      critica: valor < 50,
      recomendacao:
        'Sua glicemia está muito baixa. Consuma rapidamente carboidratos de rápida absorção: 1 copo de água com açúcar, suco de fruta ou balas. Evite exercícios imediatos. Após 15 minutos, verifique novamente a glicemia. Se persistir abaixo de 70 mg/dL, repita o procedimento e procure orientação médica.',
    };
  }

  if (valor <= 140) {
    return {
      categoria: 'normal',
      titulo: 'Glicemia Normal',
      cor: 'emerald',
      critica: false,
      recomendacao:
        'Parabéns! Sua dieta está satisfatória. Continue com o uso correto do seu medicamento, mantenha uma alimentação balanceada, beba bastante água e pratique atividade física regularmente.',
    };
  }

  if (valor <= 180) {
    return {
      categoria: 'alta',
      titulo: 'Glicemia Alta',
      cor: 'orange',
      critica: false,
      recomendacao:
        'Atenção! Evite carboidratos simples, açúcares e massas refinadas. Dê preferência a alimentos ricos em fibras (vegetais, folhas), proteínas magras e beba muita água. Siga a orientação do seu medicamento e monitore novamente em algumas horas.',
    };
  }

  return {
    categoria: 'muito_alta',
    titulo: 'Glicemia Muito Alta',
    cor: 'red',
    critica: valor > 300,
    recomendacao:
      'Atenção! Sua glicemia está muito elevada. Evite carboidratos simples, açúcares e massas refinadas. Dê preferência a alimentos ricos em fibras (vegetais, folhas), proteínas magras e muita água. Siga a orientação do seu medicamento. Se a glicemia permanecer acima de 300 mg/dL, procure orientação médica.',
  };
}
