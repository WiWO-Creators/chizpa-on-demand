import type { ChizpaService } from "../data/services";

export function DeliverablePreview({ service }: { service: ChizpaService }) {
  if (service.category === "Presentaciones") {
    return (
      <div className="deliverable deliverable--slides" aria-hidden="true">
        <span className="deliverable__slide deliverable__slide--cover"><b>{service.shortTitle}</b><small>Portada</small></span>
        <span className="deliverable__slide"><b>El argumento</b><i /><i /><i /></span>
        <span className="deliverable__slide"><b>Los datos</b><em /><em /><em /></span>
      </div>
    );
  }
  if (service.category === "Videos") {
    return (
      <div className="deliverable deliverable--video" aria-hidden="true">
        <span className="deliverable__play" />
        <span className="deliverable__caption">{service.result}</span>
        <span className="deliverable__bar" />
      </div>
    );
  }
  if (service.id === "cv-linkedin" || service.category === "Documentos") {
    return (
      <div className="deliverable deliverable--doc" aria-hidden="true">
        <span className="deliverable__avatar" />
        <b />
        <i />
        <i />
        <i />
        <em />
        <em />
      </div>
    );
  }
  if (service.category === "Diseño") {
    return (
      <div className="deliverable deliverable--phone" aria-hidden="true">
        <span>
          <small>Invitación</small>
          <b>{service.shortTitle}</b>
        </span>
      </div>
    );
  }
  return (
    <div className="deliverable deliverable--sheet" aria-hidden="true">
      <span /><span /><span />
      <i /><i /><i /><i />
    </div>
  );
}
