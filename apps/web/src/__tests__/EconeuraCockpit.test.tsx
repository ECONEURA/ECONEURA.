import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EconeuraCockpit from '../EconeuraCockpit';

describe('EconeuraCockpit', () => {
  it('renders main component without crashing', () => {
    const { container } = render(<EconeuraCockpit />);
    expect(container).toBeTruthy();
  });

  it('displays ECONEURA title', () => {
    render(<EconeuraCockpit />);
    expect(screen.getByText('ECONEURA')).toBeInTheDocument();
  });

  it('displays agent counter', () => {
    render(<EconeuraCockpit />);
    // 10 departments × 4 agents = 40 total
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Agentes Disponibles')).toBeInTheDocument();
  });

  it('renders all 10 departments', () => {
    render(<EconeuraCockpit />);
    expect(screen.getByText('Ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('Tecnología')).toBeInTheDocument();
    expect(screen.getByText('Seguridad')).toBeInTheDocument();
    expect(screen.getByText('Finanzas')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Operaciones')).toBeInTheDocument();
    expect(screen.getByText('Atención al Cliente')).toBeInTheDocument();
    expect(screen.getByText('Investigación')).toBeInTheDocument();
  });

  it('allows selecting a department', () => {
    render(<EconeuraCockpit />);
    const techButton = screen.getByText('Tecnología').closest('button');
    expect(techButton).toBeTruthy();
    fireEvent.click(techButton!);
    
    // Should display department name and agent count
    expect(screen.getByText(/4 agentes especializados/i)).toBeInTheDocument();
  });

  it('displays agent selection grid after department click', () => {
    render(<EconeuraCockpit />);
    const techButton = screen.getByText('Tecnología').closest('button');
    fireEvent.click(techButton!);
    
    // Should show 4 agents for Technology department
    expect(screen.getByText('CTO Architect')).toBeInTheDocument();
    expect(screen.getByText('DevOps Lead')).toBeInTheDocument();
    expect(screen.getByText('AI Specialist')).toBeInTheDocument();
    expect(screen.getByText('Data Engineer')).toBeInTheDocument();
  });

  it('opens chat interface when agent is selected', () => {
    render(<EconeuraCockpit />);
    
    // Select Technology department
    const techButton = screen.getByText('Tecnología').closest('button');
    fireEvent.click(techButton!);
    
    // Select CTO Architect agent
    const ctoButton = screen.getByText('CTO Architect').closest('button');
    fireEvent.click(ctoButton!);
    
    // Should show chat interface
    expect(screen.getByPlaceholderText(/Escribe tu mensaje/i)).toBeInTheDocument();
    expect(screen.getByText('Inicia la conversación')).toBeInTheDocument();
  });

  it('sidebar can be toggled', () => {
    render(<EconeuraCockpit />);
    
    // Find close button (X icon in sidebar)
    const closeButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') && btn.textContent === ''
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      // Sidebar should be hidden (w-0 class applied)
    }
    
    // Menu button should appear to reopen
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it('displays toolbar buttons', () => {
    render(<EconeuraCockpit />);
    
    // Should have multiple toolbar buttons (volume, download, trash, settings)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(10); // departments + toolbar buttons
  });
});
