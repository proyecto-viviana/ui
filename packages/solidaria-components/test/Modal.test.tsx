/**
 * Modal tests - Port of React Aria's Modal.test.tsx
 *
 * Tests for Modal component functionality including:
 * - Rendering
 * - Open/close behavior
 * - Dismissal (click outside, Escape)
 * - Focus management
 * - ARIA attributes
 * - ModalOverlay
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vite-plus/test";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import { Modal, ModalOverlay } from "../src/Modal";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("Modal", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class when open", () => {
      render(() => (
        <Modal isOpen>
          <div>Modal Content</div>
        </Modal>
      ));

      const modal = document.querySelector(".solidaria-Modal");
      expect(modal).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(() => (
        <Modal isOpen={false}>
          <div>Modal Content</div>
        </Modal>
      ));

      const modal = document.querySelector(".solidaria-Modal");
      expect(modal).not.toBeInTheDocument();
    });

    it("should render children when open", () => {
      render(() => (
        <Modal isOpen>
          <div>Modal Content</div>
        </Modal>
      ));

      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => (
        <Modal isOpen class="my-modal">
          <div>Modal Content</div>
        </Modal>
      ));

      const modal = document.querySelector(".my-modal");
      expect(modal).toBeInTheDocument();
    });
  });

  // ============================================
  // OPEN/CLOSE
  // ============================================

  describe("open/close", () => {
    it("should support controlled isOpen", () => {
      // Test that modal shows when isOpen is true
      render(() => (
        <Modal isOpen>
          <div>Modal Content</div>
        </Modal>
      ));

      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should not show when isOpen is false", () => {
      render(() => (
        <Modal isOpen={false}>
          <div>Modal Content</div>
        </Modal>
      ));

      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
    });

    it("should support defaultOpen", () => {
      render(() => (
        <Modal defaultOpen>
          <div>Modal Content</div>
        </Modal>
      ));

      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should call onOpenChange when closing", async () => {
      const onOpenChange = vi.fn();
      render(() => (
        <Modal isOpen onOpenChange={onOpenChange} isDismissable>
          <div>Modal Content</div>
        </Modal>
      ));

      // Press Escape to close
      await user.keyboard("{Escape}");

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================
  // DISMISSAL
  // ============================================

  describe("dismissal", () => {
    it("should close on Escape by default", async () => {
      const onOpenChange = vi.fn();
      render(() => (
        <Modal isOpen onOpenChange={onOpenChange}>
          <div>Modal Content</div>
        </Modal>
      ));

      await user.keyboard("{Escape}");

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should not close on Escape when isKeyboardDismissDisabled", async () => {
      const onOpenChange = vi.fn();
      render(() => (
        <Modal isOpen onOpenChange={onOpenChange} isKeyboardDismissDisabled>
          <div>Modal Content</div>
        </Modal>
      ));

      await user.keyboard("{Escape}");

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("should close on click outside when isDismissable", async () => {
      const onOpenChange = vi.fn();
      render(() => (
        <div>
          <Modal isOpen onOpenChange={onOpenChange} isDismissable>
            <div>Modal Content</div>
          </Modal>
          <button>Outside Button</button>
        </div>
      ));

      // Click outside the modal
      const outsideButton = screen.getByText("Outside Button");
      await user.click(outsideButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should not close on click outside when not isDismissable", async () => {
      const onOpenChange = vi.fn();
      render(() => (
        <div>
          <Modal isOpen onOpenChange={onOpenChange}>
            <div>Modal Content</div>
          </Modal>
          <button>Outside Button</button>
        </div>
      ));

      const outsideButton = screen.getByText("Outside Button");
      await user.click(outsideButton);

      // Should not call onOpenChange since isDismissable is false
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it("should close only the top-most modal on Escape when nested", async () => {
      const onOuterOpenChange = vi.fn();
      const onInnerOpenChange = vi.fn();

      render(() => (
        <>
          <Modal isOpen onOpenChange={onOuterOpenChange}>
            <div>Outer Modal</div>
          </Modal>
          <Modal isOpen onOpenChange={onInnerOpenChange}>
            <div>Inner Modal</div>
          </Modal>
        </>
      ));

      await user.keyboard("{Escape}");

      expect(onInnerOpenChange).toHaveBeenCalledWith(false);
      expect(onOuterOpenChange).not.toHaveBeenCalledWith(false);
    });

    it("should close only the top-most dismissable modal on outside click", async () => {
      const onOuterOpenChange = vi.fn();
      const onInnerOpenChange = vi.fn();

      render(() => (
        <div>
          <Modal isOpen onOpenChange={onOuterOpenChange} isDismissable>
            <div>Outer Modal</div>
          </Modal>
          <Modal isOpen onOpenChange={onInnerOpenChange} isDismissable>
            <div>Inner Modal</div>
          </Modal>
          <button>Outside Button</button>
        </div>
      ));

      await user.click(screen.getByText("Outside Button"));

      await waitFor(() => {
        expect(onInnerOpenChange).toHaveBeenCalledWith(false);
      });
      expect(onOuterOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  // ============================================
  // MODAL OVERLAY
  // ============================================

  describe("ModalOverlay", () => {
    it("should render ModalOverlay with default class", () => {
      render(() => (
        <ModalOverlay isOpen>
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".solidaria-ModalOverlay");
      expect(overlay).toBeInTheDocument();
    });

    it("should render both overlay and modal", () => {
      render(() => (
        <ModalOverlay isOpen>
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".solidaria-ModalOverlay");
      const modal = document.querySelector(".solidaria-Modal");

      expect(overlay).toBeInTheDocument();
      expect(modal).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(() => (
        <ModalOverlay isOpen={false}>
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".solidaria-ModalOverlay");
      expect(overlay).not.toBeInTheDocument();
    });

    it("should render with custom overlay class", () => {
      render(() => (
        <ModalOverlay isOpen class="my-overlay">
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".my-overlay");
      expect(overlay).toBeInTheDocument();
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-entering on overlay when isEntering", () => {
      render(() => (
        <ModalOverlay isOpen isEntering>
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".solidaria-ModalOverlay");
      expect(overlay).toHaveAttribute("data-entering");
    });

    it("should have data-exiting on overlay when isExiting", () => {
      render(() => (
        <ModalOverlay isOpen isExiting>
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".solidaria-ModalOverlay");
      expect(overlay).toHaveAttribute("data-exiting");
    });

    it("should not have data-entering when not entering", () => {
      render(() => (
        <ModalOverlay isOpen>
          <Modal>
            <div>Modal Content</div>
          </Modal>
        </ModalOverlay>
      ));

      const overlay = document.querySelector(".solidaria-ModalOverlay");
      expect(overlay).not.toHaveAttribute("data-entering");
    });
  });

  // ============================================
  // RENDER PROPS
  // ============================================

  describe("render props", () => {
    it("should provide isEntering to ModalOverlay render function", () => {
      let receivedProps: { isEntering: boolean } | undefined;
      render(() => (
        <ModalOverlay isOpen isEntering>
          {(props) => {
            receivedProps = props;
            return (
              <Modal>
                <div>Modal Content</div>
              </Modal>
            );
          }}
        </ModalOverlay>
      ));

      expect(receivedProps?.isEntering).toBe(true);
    });

    it("should provide isExiting to ModalOverlay render function", () => {
      let receivedProps: { isExiting: boolean } | undefined;
      render(() => (
        <ModalOverlay isOpen isExiting>
          {(props) => {
            receivedProps = props;
            return (
              <Modal>
                <div>Modal Content</div>
              </Modal>
            );
          }}
        </ModalOverlay>
      ));

      expect(receivedProps?.isExiting).toBe(true);
    });
  });
});
