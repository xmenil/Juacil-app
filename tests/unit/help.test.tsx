import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelpPage } from '@/pages/help/HelpPage';

afterEach(cleanup);

function mount() {
  render(<MemoryRouter initialEntries={['/ayuda#encuesta']}><HelpPage /></MemoryRouter>);
  return userEvent.setup();
}

describe('Encuesta demo de Ayuda', () => {
  it('abre el enlace directo sin respuestas y enfoca la primera pregunta pendiente', async () => {
    const user = mount();
    expect(screen.getAllByRole('radio')).toHaveLength(50);
    expect(screen.getAllByRole('radio').every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Finalizar encuesta demo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('faltan 10 preguntas');
    expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    expect(screen.queryByRole('heading', { name: 'Terminaste la encuesta demo' })).not.toBeInTheDocument();
  });

  it('conserva respuestas entre secciones y permite revisar tras finalizar sin guardar datos', async () => {
    const user = mount();
    const previousStorage = { ...localStorage };
    for (const group of screen.getAllByRole('group').filter(group => group.tagName === 'FIELDSET')) {
      await user.click(within(group).getAllByRole('radio')[0]);
    }
    await user.click(screen.getByRole('button', { name: 'Preguntas frecuentes' }));
    await user.click(screen.getByRole('button', { name: 'Evalúa JUÁCIL' }));
    expect(screen.getByText('10 de 10 preguntas respondidas')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Finalizar encuesta demo' }));
    expect(screen.getByRole('heading', { name: 'Terminaste la encuesta demo' })).toHaveFocus();
    expect(screen.queryByText(/4\.8/)).not.toBeInTheDocument();
    expect({ ...localStorage }).toEqual(previousStorage);
    await user.click(screen.getByRole('button', { name: 'Revisar mis respuestas' }));
    expect(screen.getAllByRole('radio').filter(radio => (radio as HTMLInputElement).checked)).toHaveLength(10);
  });
});
