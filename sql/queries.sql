-- Query 1:
-- Customer names and countries that used United Package (ShipperID = 2) as their shipper,
-- each customer listed once, with the number of such orders and their total value
-- (quantity × unit price). Sorted by total value, highest first.

SELECT
    c.CustomerName,
    c.Country,
    COUNT(DISTINCT o.OrderID)                              AS OrderCount,
    ROUND(SUM(od.Quantity * p.Price), 2)                   AS TotalValue
FROM Customers c
JOIN Orders o        ON o.CustomerID   = c.CustomerID
JOIN OrderDetails od ON od.OrderID     = o.OrderID
JOIN Products p      ON p.ProductID    = od.ProductID
JOIN Shippers s      ON s.ShipperID    = o.ShipperID
WHERE s.ShipperName = 'United Package'
GROUP BY c.CustomerName, c.Country
ORDER BY TotalValue DESC;


-- Query 2:
-- Customers who placed at least one order but never used United Package.

SELECT DISTINCT c.CustomerName, c.Country
FROM Customers c
JOIN Orders o ON o.CustomerID = c.CustomerID
WHERE c.CustomerID NOT IN (
    SELECT o2.CustomerID
    FROM Orders o2
    JOIN Shippers s ON s.ShipperID = o2.ShipperID
    WHERE s.ShipperName = 'United Package'
)
ORDER BY c.CustomerName;
