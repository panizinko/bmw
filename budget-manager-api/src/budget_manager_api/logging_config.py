import logging
import sys

import structlog


def setup_logging():
    """
    Configures structured logging for the application.
    """

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    structlog.configure(
        processors=shared_processors
        + [
            # This prepares the log record for the final renderer.
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        # Use a logger factory that integrates with standard logging.
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # In production, you'd likely use JSONRenderer for machine-readability.
    # For development, ConsoleRenderer is more human-friendly.
    formatter = structlog.stdlib.ProcessorFormatter(
        processor=structlog.dev.ConsoleRenderer(colors=True),
        foreign_pre_chain=shared_processors,
    )

    # Get the root handler to apply our new formatter.
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Get the root logger and add our configured handler.
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

    # Silence other loggers that are too noisy
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
