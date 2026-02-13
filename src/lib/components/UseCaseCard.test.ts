/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import UseCaseCard from './UseCaseCard.svelte';
import type { UseCase } from '../../core/domain/index.js';

describe('UseCaseCard', () => {
  const baseUseCase: UseCase = {
    id: 'test-use-case',
    name: 'Test Use Case',
    description: 'A test use case description',
    participants: [],
    steps: [],
  };

  it('renders use case name', () => {
    render(UseCaseCard, { props: { useCase: baseUseCase } });
    expect(screen.getByText('Test Use Case')).toBeInTheDocument();
  });

  it('renders use case description', () => {
    render(UseCaseCard, { props: { useCase: baseUseCase } });
    expect(screen.getByText('A test use case description')).toBeInTheDocument();
  });

  it('links to use case detail page', () => {
    render(UseCaseCard, { props: { useCase: baseUseCase } });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/use-cases/test-use-case');
  });

  it('truncates long descriptions with ellipsis', () => {
    const longDesc = 'A'.repeat(150);
    const useCaseWithLongDesc: UseCase = {
      ...baseUseCase,
      description: longDesc,
    };
    render(UseCaseCard, { props: { useCase: useCaseWithLongDesc } });
    // Should truncate to 120 chars + "..."
    expect(screen.getByText(/^A{100,120}\.\.\.$/)).toBeInTheDocument();
  });

  it('shows BPMN badge when bpmn is defined', () => {
    const useCaseWithBpmn: UseCase = {
      ...baseUseCase,
      bpmn: './diagram.bpmn',
    };
    render(UseCaseCard, { props: { useCase: useCaseWithBpmn } });
    expect(screen.getByText('BPMN')).toBeInTheDocument();
  });

  it('does not show BPMN badge when no bpmn', () => {
    render(UseCaseCard, { props: { useCase: baseUseCase } });
    expect(screen.queryByText('BPMN')).not.toBeInTheDocument();
  });

  it('shows participant count', () => {
    const useCaseWithParticipants: UseCase = {
      ...baseUseCase,
      participants: [
        { service: 'svc-1', role: 'Role 1' },
        { service: 'svc-2', role: 'Role 2' },
      ],
    };
    render(UseCaseCard, { props: { useCase: useCaseWithParticipants } });
    expect(screen.getByText('2 participants')).toBeInTheDocument();
  });

  it('shows singular participant when count is 1', () => {
    const useCaseWithOneParticipant: UseCase = {
      ...baseUseCase,
      participants: [{ service: 'svc-1', role: 'Role 1' }],
    };
    render(UseCaseCard, { props: { useCase: useCaseWithOneParticipant } });
    expect(screen.getByText('1 participant')).toBeInTheDocument();
  });

  it('shows step count', () => {
    const useCaseWithSteps: UseCase = {
      ...baseUseCase,
      steps: [
        { sequence: 1, action: 'Step 1' },
        { sequence: 2, action: 'Step 2' },
        { sequence: 3, action: 'Step 3' },
      ],
    };
    render(UseCaseCard, { props: { useCase: useCaseWithSteps } });
    expect(screen.getByText('3 steps')).toBeInTheDocument();
  });

  it('shows singular step when count is 1', () => {
    const useCaseWithOneStep: UseCase = {
      ...baseUseCase,
      steps: [{ sequence: 1, action: 'Step 1' }],
    };
    render(UseCaseCard, { props: { useCase: useCaseWithOneStep } });
    expect(screen.getByText('1 step')).toBeInTheDocument();
  });
});
